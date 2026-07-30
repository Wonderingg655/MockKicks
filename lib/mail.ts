import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'bosspollawit@gmail.com', pass: 'xumy ajow yfnr nyfx' },
})

export async function sendOrderNotification(orderId: number, customerName: string, customerEmail: string, customerPhone: string, address: string, city: string, state: string, postalCode: string, country: string, total: number, paymentMethod: string, items: any[]) {
  const itemsHtml = items.map((item: any) => {
    const lineTotal = Number(item.price) * Number(item.quantity)
    return `<tr><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;">${item.name}</td><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#666;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right;">฿${Number(item.price).toLocaleString()}</td><td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right;">฿${lineTotal.toLocaleString()}</td></tr>`
  }).join('')

  await transporter.sendMail({
    from: '"Mock Kicks" <bosspollawit@gmail.com>',
    to: 'bosspollawit@gmail.com',
    subject: `New Order #${orderId} - Mock Kicks`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;"><h2 style="color:#111;margin:0 0 4px;">New Order #${orderId}</h2><p style="font-size:13px;color:#666;margin:0 0 20px;">${customerName} — ฿${total.toLocaleString()} — ${paymentMethod}</p><table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><thead><tr style="background:#f5f5f5;"><th style="padding:8px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;">Item</th><th style="padding:8px;text-align:center;font-size:11px;color:#666;text-transform:uppercase;">Qty</th><th style="padding:8px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;">Price</th><th style="padding:8px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;">Total</th></tr></thead><tbody>${itemsHtml}</tbody><tfoot><tr><td colspan="3" style="padding:8px;text-align:right;font-size:13px;font-weight:bold;border-top:2px solid #111;">Total</td><td style="padding:8px;text-align:right;font-size:13px;font-weight:bold;border-top:2px solid #111;">฿${total.toLocaleString()}</td></tr></tfoot></table><div style="margin-bottom:20px;padding:14px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;"><h3 style="margin:0 0 6px;font-size:12px;color:#666;text-transform:uppercase;">Customer</h3><p style="margin:0;font-size:13px;color:#333;line-height:1.5;">${customerName}<br>${customerEmail}<br>${customerPhone}</p></div><div style="padding:14px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;"><h3 style="margin:0 0 6px;font-size:12px;color:#666;text-transform:uppercase;">Shipping</h3><p style="margin:0;font-size:13px;color:#333;line-height:1.5;">${address}<br>${city}, ${state} ${postalCode}<br>${country}</p></div><p style="font-size:11px;color:#999;margin-top:20px;text-align:center;">Mock Kicks — mock e-commerce project</p></div>`,
  })
}
