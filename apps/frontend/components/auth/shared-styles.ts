export const inputStyle = (error: boolean) => `w-4/5 d-flex max-w-80 rounded-md border-2 bg-white ${error ? 'border-error-500' : 'border-secondary-300'}`

export const buttonStyle = (disabled: boolean) =>
  `mt-6 h-fit w-fit pb-3 pt-2 px-6 mx-auto rounded-2xl border-2 ${disabled ? 'bg-secondary-100/40 border-secondary-500/40 pointer-events-none' : 'bg-secondary-100 border-secondary-500 data-[active=true]:bg-secondary-700 data-[active=true]:border-secondary-900 pointer-events-auto'}`

export const buttonTextStyle = (disabled: boolean) =>
  `font-heading text-md text-center ${disabled ? 'text-secondary-700/40' : 'text-secondary-700'}`
