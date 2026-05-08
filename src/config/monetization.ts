const normalize = (value: string | undefined) => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export const monetizationConfig = {
  adsenseClientId: normalize(process.env.NEXT_PUBLIC_ADSENSE_ID),
  adsenseResultSlot: normalize(process.env.NEXT_PUBLIC_ADSENSE_RESULT_SLOT),
  adsenseFooterSlot: normalize(process.env.NEXT_PUBLIC_ADSENSE_FOOTER_SLOT),
  donationUrl: normalize(process.env.NEXT_PUBLIC_DONATION_URL),
  donationPixKey: normalize(process.env.NEXT_PUBLIC_DONATION_PIX_KEY),
  donationMessage:
    normalize(process.env.NEXT_PUBLIC_DONATION_MESSAGE) ??
    "Se esta ferramenta economizou seu tempo, voce pode apoiar o projeto sem cadastro e sem compartilhar seus dados.",
}

export const isAdsenseEnabled = Boolean(monetizationConfig.adsenseClientId)
export const hasDonationEnabled = Boolean(
  monetizationConfig.donationUrl || monetizationConfig.donationPixKey
)
