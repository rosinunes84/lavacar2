// public/js/enviarPush.js
export async function enviarPush(titulo, mensagem, oneSignalUserId) {
  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Authorization": "os_v2_app_wnn6fuk7qrcmfl4nfyxlmwark5r3ctu2cave345k7nfu25vye3gq7apkdhqs6rtv7mwmkss43t3aft6zo7jbpsboyo37hanzjh52s4a",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_id: "b35be2d1-5f84-44c2-af8d-2e2eb6581157",
      headings: { en: titulo },
      contents: { en: mensagem },
      include_player_ids: [oneSignalUserId],
    }),
  });
}
