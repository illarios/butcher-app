import type { Order } from '@/types'

function formatEur(n: number): string {
  return n.toFixed(2).replace('.', ',') + '€'
}

function formatWeight(grams: number): string {
  if (grams >= 1000) return `${(grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1)} κιλά`
  return `${grams} γρ`
}

// ── Customer confirmation ─────────────────────────────────────────────────────
export function orderReceivedEmail(order: Order, customerName?: string): string {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;">
          ${item.product_name}${item.cut_name ? ` — ${item.cut_name}` : ''}
          ${item.notes ? `<br><span style="color:#999;font-size:12px;">"${item.notes}"</span>` : ''}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;text-align:right;white-space:nowrap;">
          ${formatWeight(item.weight_grams)}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;text-align:right;white-space:nowrap;">
          ${formatEur(item.line_total)}
        </td>
      </tr>`
    )
    .join('')

  const fulfillmentGreek =
    order.fulfillment_type === 'pickup' ? 'Παραλαβή από κατάστημα' : 'Διανομή στο σπίτι'
  const paymentGreek =
    order.payment_method === 'cop' ? 'Πληρωμή κατά την παραλαβή' : 'Πληρωμή κατά την παράδοση'

  return `
    <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#2E2E2E;">
      <div style="background:#C8102E;padding:24px 32px;">
        <h1 style="color:#F5EFE6;font-size:22px;margin:0;letter-spacing:0.15em;text-transform:uppercase;">
          ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
        </h1>
      </div>

      <div style="padding:32px;">
        <h2 style="font-size:20px;margin-bottom:8px;">
          Η παραγγελία σας ελήφθη!
        </h2>
        <p style="color:#666;font-size:14px;margin-bottom:24px;">
          Γεια σας${customerName ? ` ${customerName}` : ''}, ευχαριστούμε για την παραγγελία σας.
        </p>

        <!-- Order number -->
        <div style="background:#F5EFE6;border:1px solid #EDE0D0;padding:16px 20px;margin-bottom:24px;">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:0.2em;color:#999;margin:0 0 4px;">
            Αριθμός παραγγελίας
          </p>
          <p style="font-size:22px;font-weight:bold;color:#C8102E;margin:0;">
            ${order.order_number}
          </p>
        </div>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:2px solid #EDE0D0;">Προϊόν</th>
              <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:2px solid #EDE0D0;">Βάρος</th>
              <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:2px solid #EDE0D0;">Τιμή</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>

        <!-- Totals -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0;">Υποσύνολο</td>
            <td style="font-size:13px;color:#2E2E2E;text-align:right;">${formatEur(order.subtotal)}</td>
          </tr>
          ${order.delivery_fee > 0 ? `
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0;">Μεταφορικά</td>
            <td style="font-size:13px;color:#2E2E2E;text-align:right;">${formatEur(order.delivery_fee)}</td>
          </tr>` : ''}
          ${order.loyalty_discount > 0 ? `
          <tr>
            <td style="font-size:13px;color:#666;padding:4px 0;">Έκπτωση πόντων</td>
            <td style="font-size:13px;color:#C8102E;text-align:right;">-${formatEur(order.loyalty_discount)}</td>
          </tr>` : ''}
          <tr>
            <td style="font-size:16px;font-weight:bold;padding-top:8px;border-top:2px solid #EDE0D0;">ΣΥΝΟΛΟ</td>
            <td style="font-size:16px;font-weight:bold;color:#C8102E;text-align:right;padding-top:8px;border-top:2px solid #EDE0D0;">${formatEur(order.total)}</td>
          </tr>
        </table>

        <!-- Fulfillment info -->
        <div style="background:#F5EFE6;border:1px solid #EDE0D0;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:13px;"><strong>Τρόπος παραλαβής:</strong> ${fulfillmentGreek}</p>
          <p style="margin:0 0 4px;font-size:13px;"><strong>Πληρωμή:</strong> ${paymentGreek}</p>
          ${order.loyalty_points_earned > 0 ? `
          <p style="margin:8px 0 0;font-size:13px;color:#C8102E;">
            ✦ Κερδίσατε <strong>${order.loyalty_points_earned} πόντους</strong> επιβράβευσης!
          </p>` : ''}
        </div>

        <!-- Info box -->
        <div style="border-left:3px solid #C8102E;padding:12px 16px;background:#fff8f8;font-size:13px;color:#666;">
          Ο Μάρκος θα επιβεβαιώσει σύντομα τον χρόνο ετοιμότητας της παραγγελίας σας.
          Θα λάβετε ειδοποίηση μόλις η παραγγελία είναι έτοιμη.
        </div>
      </div>

      <div style="background:#0D0D0D;padding:20px 32px;text-align:center;">
        <p style="color:#F5EFE6;opacity:0.4;font-size:12px;margin:0;">
          Κρεοπωλείο Μάρκος — Ιθάκης 12, Αθήνα
        </p>
      </div>
    </div>
  `
}

// ── Order Confirmed (customer) ────────────────────────────────────────────────
export function orderConfirmedEmail(
  order: Order,
  customerName?: string,
  readyAt?: string | null,
  adminNote?: string | null,
): string {
  const firstName = customerName?.split(' ')[0] ?? ''

  // Format ready time: "Σήμερα στις 14:30" or "Αύριο Τετάρτη στις 10:00"
  let timeLabel = ''
  if (readyAt) {
    const readyDate  = new Date(readyAt)
    const now        = new Date()
    const isToday    = readyDate.toDateString() === now.toDateString()
    const tomorrow   = new Date(now); tomorrow.setDate(now.getDate() + 1)
    const isTomorrow = readyDate.toDateString() === tomorrow.toDateString()
    const timeStr    = readyDate.toLocaleTimeString('el-GR', { hour: '2-digit', minute: '2-digit' })
    if (isToday) {
      timeLabel = `Σήμερα στις ${timeStr}`
    } else if (isTomorrow) {
      const dayName = readyDate.toLocaleDateString('el-GR', { weekday: 'long' })
      timeLabel = `Αύριο ${dayName.charAt(0).toUpperCase() + dayName.slice(1)} στις ${timeStr}`
    } else {
      timeLabel = readyDate.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' }) + ` στις ${timeStr}`
    }
  }

  const itemsHtml = order.items
    .map((item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;">
          ${item.product_name}${item.cut_name ? ` — ${item.cut_name}` : ''}
          ${item.notes ? `<br><span style="color:#999;font-size:12px;">"${item.notes}"</span>` : ''}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;text-align:right;white-space:nowrap;">
          ${formatWeight(item.weight_grams)}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EDE0D0;font-size:14px;color:#2E2E2E;text-align:right;white-space:nowrap;">
          ${formatEur(item.line_total)}
        </td>
      </tr>`)
    .join('')

  const paymentGreek = order.payment_method === 'cop'
    ? 'Πληρωμή κατά την παραλαβή'
    : 'Πληρωμή κατά την παράδοση'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kreopoleiomakros.gr'

  return `
    <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#2E2E2E;background:#F5EFE6;">

      <!-- Header -->
      <div style="background:#F5EFE6;padding:28px 32px 0;">
        <h1 style="font-size:20px;letter-spacing:0.2em;text-transform:uppercase;color:#C8102E;margin:0;">
          ΚΡΕΟΠΩΛΕΙΟ ΜΑΡΚΟΣ
        </h1>
        <div style="height:2px;background:#C8102E;margin-top:12px;"></div>
      </div>

      <!-- Body -->
      <div style="padding:32px;">

        <!-- Greeting -->
        <p style="font-size:16px;margin:0 0 24px;">Γεια σας${firstName ? ` ${firstName}` : ''},</p>

        <!-- Hero time block -->
        ${readyAt ? `
        <div style="background:#0D0D0D;border-radius:6px;padding:28px 24px;margin-bottom:24px;text-align:center;">
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:#F5EFE6;opacity:0.5;margin:0 0 8px;">
            Η παραγγελία σας θα είναι έτοιμη
          </p>
          <p style="font-size:42px;font-weight:bold;color:#C8102E;margin:0;line-height:1.1;font-family:Georgia,serif;">
            ${timeLabel}
          </p>
          <p style="font-size:13px;color:#F5EFE6;opacity:0.7;margin:12px 0 0;">
            ${order.fulfillment_type === 'pickup'
              ? 'Σας περιμένουμε στο κατάστημά μας'
              : 'Ο διανομέας θα φτάσει γύρω στην ώρα αυτή'}
          </p>
        </div>` : ''}

        <!-- Order summary -->
        <div style="background:white;border:1px solid #EDE0D0;padding:20px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:1px solid #EDE0D0;">Προϊόν</th>
                <th style="text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:1px solid #EDE0D0;">Βάρος</th>
                <th style="text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;padding-bottom:8px;border-bottom:1px solid #EDE0D0;">Τιμή</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <table style="width:100%;border-collapse:collapse;margin-top:12px;">
            ${order.delivery_fee > 0 ? `
            <tr>
              <td style="font-size:13px;color:#666;padding:3px 0;">Μεταφορικά</td>
              <td style="font-size:13px;color:#2E2E2E;text-align:right;">${formatEur(order.delivery_fee)}</td>
            </tr>` : ''}
            ${order.loyalty_discount > 0 ? `
            <tr>
              <td style="font-size:13px;color:#666;padding:3px 0;">Έκπτωση πόντων</td>
              <td style="font-size:13px;color:#C8102E;text-align:right;">-${formatEur(order.loyalty_discount)}</td>
            </tr>` : ''}
            <tr>
              <td style="font-size:15px;font-weight:bold;padding-top:8px;border-top:2px solid #EDE0D0;">ΣΥΝΟΛΟ</td>
              <td style="font-size:15px;font-weight:bold;color:#C8102E;text-align:right;padding-top:8px;border-top:2px solid #EDE0D0;">${formatEur(order.total)}</td>
            </tr>
          </table>
          <!-- Payment badge -->
          <p style="margin:12px 0 0;display:inline-block;background:#fef9c3;border:1px solid #fde047;color:#713f12;font-size:11px;padding:3px 10px;border-radius:2px;">
            ${paymentGreek}
          </p>
        </div>

        <!-- Admin note (conditional) -->
        ${adminNote ? `
        <div style="background:white;border:1px solid #EDE0D0;border-left:3px solid #C8102E;padding:16px;margin-bottom:24px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;margin:0 0 6px;">
            ✉️ Μήνυμα από τον Μάρκο:
          </p>
          <p style="font-size:14px;font-style:italic;color:#2E2E2E;margin:0;">"${adminNote}"</p>
        </div>` : ''}

        <!-- Order details -->
        ${order.fulfillment_type === 'delivery' && order.delivery_address ? `
        <div style="background:white;border:1px solid #EDE0D0;padding:16px;margin-bottom:24px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;margin:0 0 6px;">Διεύθυνση παράδοσης</p>
          <p style="font-size:14px;margin:0;">${(order.delivery_address as any).street ?? ''} ${(order.delivery_address as any).number ?? ''}, ${(order.delivery_address as any).city ?? ''} ${(order.delivery_address as any).postal_code ?? ''}</p>
        </div>` : ''}
        ${order.fulfillment_type === 'pickup' ? `
        <div style="background:white;border:1px solid #EDE0D0;padding:16px;margin-bottom:24px;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#999;margin:0 0 6px;">Διεύθυνση καταστήματος</p>
          <p style="font-size:14px;margin:0;">Ιθάκης 12, Αθήνα</p>
        </div>` : ''}

        <!-- CTA -->
        <div style="text-align:center;margin:28px 0;">
          <a
            href="${siteUrl}/account/orders/${order.id}"
            style="display:inline-block;background:#C8102E;color:white;font-size:13px;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:14px 32px;"
          >
            Παρακολουθήστε την παραγγελία σας
          </a>
        </div>

        <!-- Footer note -->
        <p style="font-size:12px;color:#999;text-align:center;margin:0;">
          Για οποιαδήποτε απορία καλέστε μας: <a href="tel:+302101234567" style="color:#C8102E;text-decoration:none;">210 123 4567</a>
        </p>
      </div>

      <!-- Footer -->
      <div style="background:#0D0D0D;padding:20px 32px;text-align:center;">
        <p style="color:#F5EFE6;opacity:0.4;font-size:12px;margin:0;">
          Κρεοπωλείο Μάρκος — Ιθάκης 12, Αθήνα — Δευτ–Σαββ 07:00–15:00
        </p>
      </div>
    </div>`
}

// ── Admin notification ────────────────────────────────────────────────────────
export function adminNewOrderEmail(order: Order): string {
  const itemsList = order.items
    .map((i) => `• ${i.product_name}${i.cut_name ? ` (${i.cut_name})` : ''} — ${(i.weight_grams / 1000).toFixed(2)} kg — ${formatEur(i.line_total)}${i.notes ? ` — "${i.notes}"` : ''}`)
    .join('<br>')

  return `
    <div style="font-family:monospace;max-width:540px;margin:0 auto;color:#2E2E2E;">
      <div style="background:#C8102E;padding:16px 24px;">
        <h1 style="color:white;font-size:16px;margin:0;letter-spacing:0.1em;">🔔 ΝΕΑ ΠΑΡΑΓΓΕΛΙΑ — ${order.order_number}</h1>
      </div>
      <div style="padding:24px;background:#F5EFE6;border:2px solid #C8102E;">
        <p style="font-size:18px;font-weight:bold;color:#C8102E;margin:0 0 16px;">${order.order_number}</p>
        <p style="font-size:13px;margin:0 0 8px;"><strong>Τρόπος:</strong> ${order.fulfillment_type === 'pickup' ? 'ΠΑΡΑΛΑΒΗ' : 'DELIVERY'}</p>
        <p style="font-size:13px;margin:0 0 8px;"><strong>Πληρωμή:</strong> ${order.payment_method.toUpperCase()}</p>
        <p style="font-size:13px;margin:0 0 16px;"><strong>Σύνολο:</strong> ${formatEur(order.total)}</p>
        <hr style="border:1px solid #EDE0D0;margin:16px 0;">
        <p style="font-size:13px;margin:0 0 8px;"><strong>Προϊόντα:</strong></p>
        <p style="font-size:13px;margin:0;line-height:1.8;">${itemsList}</p>
        ${order.delivery_address ? `
        <hr style="border:1px solid #EDE0D0;margin:16px 0;">
        <p style="font-size:13px;margin:0;"><strong>Διεύθυνση:</strong> ${JSON.stringify(order.delivery_address)}</p>
        ` : ''}
      </div>
    </div>
  `
}
