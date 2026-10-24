// hongdam.net/swan → the Black Swan page (one prediction is /swan/<id>, functions/swan/[id].js).
export const onRequest = ({ request }) => Response.redirect(new URL('/studio/black-swan/', request.url).href, 302)
