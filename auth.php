<?php
  $client_id = 'YOUR_CLIENT_ID';
  $client_secret = 'YOUR_CLIENT_SECRET';

  // Data to send
  $postData = array(
    'client_id' => $client_id,
    'client_secret' => $client_secret,
    'code' => $_GET['code']
  );

  // Setup cURL
  $ch = curl_init('https://github.com/login/oauth/access_token');  
  curl_setopt_array($ch, array(
    CURLOPT_POST => TRUE,
    CURLOPT_RETURNTRANSFER => TRUE,
    CURLOPT_HTTPHEADER => array(
      'Content-Type: application/json',
      'Accept: application/json'
    ),
    CURLOPT_POSTFIELDS => json_encode($postData)
  ));

  // Send the request
  $response = curl_exec($ch);

  // Check for errors
  if ($response === FALSE) {
    die(curl_error($ch));
  }

  // Decode response
  $responseData = json_decode($response, TRUE);
?>
<!DOCTYPE html>
<html>
  <head>
    <script>
      opener.authComplete('<?php echo $responseData['access_token'] ?>');
      window.close();
    </script>
  </head>
  <body>
You will be redirected to the dashboard shortly...
  </body>
</html>
