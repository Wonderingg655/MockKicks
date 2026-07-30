<?php
require_once __DIR__ . '/lib/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/lib/PHPMailer/SMTP.php';
require_once __DIR__ . '/lib/PHPMailer/Exception.php';
require_once __DIR__ . '/mail_config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function sendOrderNotification(int $orderId, string $customerName, string $customerEmail, string $customerPhone, string $address, string $city, string $state, string $postalCode, string $country, int $total, string $paymentMethod, array $items): bool {
  $mail = new PHPMailer(true);
  try {
    $mail->isSMTP();
    $mail->Host = SMTP_HOST;
    $mail->SMTPAuth = true;
    $mail->Username = SMTP_USERNAME;
    $mail->Password = SMTP_PASSWORD;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = SMTP_PORT;

    $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->addAddress(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
    $mail->Subject = 'New Order #' . $orderId . ' - Mock Kicks';

    $itemsHtml = '';
    foreach ($items as $item) {
      $lineTotal = (int)$item['price'] * (int)$item['quantity'];
      $itemsHtml .= '<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;">' . htmlspecialchars($item['name']) . '</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#666;text-align:center;">' . (int)$item['quantity'] . '</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right;">฿' . number_format((int)$item['price']) . '</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right;">฿' . number_format($lineTotal) . '</td>
      </tr>';
    }

    $mail->Body = '
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#111;margin:0 0 4px;">New Order #' . $orderId . '</h2>
        <p style="font-size:13px;color:#666;margin:0 0 20px;">' . htmlspecialchars($customerName) . ' — ฿' . number_format($total) . ' — ' . htmlspecialchars($paymentMethod) . '</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:8px;text-align:left;font-size:11px;color:#666;text-transform:uppercase;">Item</th>
              <th style="padding:8px;text-align:center;font-size:11px;color:#666;text-transform:uppercase;">Qty</th>
              <th style="padding:8px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;">Price</th>
              <th style="padding:8px;text-align:right;font-size:11px;color:#666;text-transform:uppercase;">Total</th>
            </tr>
          </thead>
          <tbody>' . $itemsHtml . '</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding:8px;text-align:right;font-size:13px;font-weight:bold;border-top:2px solid #111;">Total</td>
              <td style="padding:8px;text-align:right;font-size:13px;font-weight:bold;border-top:2px solid #111;">฿' . number_format($total) . '</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-bottom:20px;padding:14px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;">
          <h3 style="margin:0 0 6px;font-size:12px;color:#666;text-transform:uppercase;">Customer</h3>
          <p style="margin:0;font-size:13px;color:#333;line-height:1.5;">' . htmlspecialchars($customerName) . '<br>' . htmlspecialchars($customerEmail) . '<br>' . htmlspecialchars($customerPhone) . '</p>
        </div>

        <div style="padding:14px;background:#f9f9f9;border:1px solid #eee;border-radius:6px;">
          <h3 style="margin:0 0 6px;font-size:12px;color:#666;text-transform:uppercase;">Shipping</h3>
          <p style="margin:0;font-size:13px;color:#333;line-height:1.5;">' . htmlspecialchars($address) . '<br>' . htmlspecialchars($city) . ', ' . htmlspecialchars($state) . ' ' . htmlspecialchars($postalCode) . '<br>' . htmlspecialchars($country) . '</p>
        </div>

        <p style="font-size:11px;color:#999;margin-top:20px;text-align:center;">Mock Kicks — mock e-commerce project</p>
      </div>';

    $mail->AltBody = 'Order #' . $orderId . ' - ' . $customerName . ' - ฿' . number_format($total) . ' - ' . $paymentMethod;
    $mail->send();
    return true;
  } catch (Exception $e) {
    error_log('Mail error: ' . $e->getMessage());
    return false;
  }
}
