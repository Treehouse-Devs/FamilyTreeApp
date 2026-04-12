import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as nodemailer from 'nodemailer'
import * as fs from 'fs-extra'
import * as handlebars from 'handlebars'
import mjml2html from 'mjml'
import path from 'path'

@Injectable()
export class MailerService {
  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  async sendTemplateEmail(to: string, subject: string, templateName: string, context: Record<string, string>) {
    const templatePath = path.join(
      __dirname,
      'src/mailer/templates',
      `${templateName}.mjml`,
    )

    const mjmlTemplate = await fs.readFile(templatePath, 'utf-8')

    const mjmlHtml = mjml2html(mjmlTemplate)

    if (mjmlHtml.errors.length) {
      throw new Error(`MJML compile error: ${JSON.stringify(mjmlHtml.errors)}`)
    }

    const template = handlebars.compile(mjmlHtml.html)
    const html = template(context)
    try {
      const info = await this.transporter.sendMail({
        from: `"Treely" <${process.env.SMTP_FROM}>`,
        to,
        subject,
        html,
      })

      console.log('Email sent:', info.messageId)
    } catch (error) {
      console.error('Failed to send email:', error)
      throw new InternalServerErrorException('Email sending failed')
    }
  }
}
