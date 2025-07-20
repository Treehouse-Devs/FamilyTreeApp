import { Link as ExpoLink } from 'expo-router'

const Link = ({ href, text, isReplace }: { href: string, text: string, isReplace?: boolean }) => (
  <ExpoLink
    href={href}
    replace={isReplace === true}
    className="font-medium text-md text-center text-underline text-primary-500"
  >
    {text}
  </ExpoLink>
)

export default Link
