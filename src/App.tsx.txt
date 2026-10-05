<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reset Password · RouteMax Pro</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #0a0a0f; color: #f4f4f5;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }
  .card {
    width: 100%; max-width: 380px;
    background: #101018; border: 1px solid #27272a;
    border-radius: 20px; padding: 28px 24px;
  }
  h1 { font-size: 20px; font-weight: 800; margin-bottom: 6px; }
  p.sub { font-size: 13px; color: #71717a; line-height: 1.5; margin-bottom: 18px; }
  label { display: block; font-size: 11px; font-weight: 700; color: #a1a1aa;
          text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
  input {
    width: 100%; background: #18181b; border: 1px solid #27272a;
    border-radius: 12px; padding: 13px 14px; color: #fff;
    font-size: 16px; font-weight: 600; outline: none; margin-bottom: 12px;
  }
  input:focus { border-color: #34d399; }
  button {
    width: 100%; padding: 14px; border: none; border-radius: 12px;
    background: linear-gradient(90deg, #34d399, #14b8a6);
    color: #0a0a0f; font-size: 16px; font-weight: 800; cursor: pointer;
  }
  button:disabled { opacity: 0.5; cursor: default; }
  .msg { font-size: 13px; font-weight: 600; border-radius: 12px;
         padding: 12px 14px; margin-bottom: 14px; line-height: 1.5; }
  .err { color: #f87171; background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); }
  .ok { color: #34d399; background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); }
  .hidden { display: none; }
  .logo { font-size: 14px; font-weight: 800; color: #34d399; margin-bottom: 16px; }
</style>
</head>
<body>
<div class="card">
  <div class="logo">RouteMax Pro</div>
  <h1>Set a new password</h1>
  <p class="sub">Choose a new password for your account. You'll use it to sign in to the app.</p>
  <div id="msg"></div>
  <form id="form" class="hidden">
    <label for="pw1">New password</label>
    <input id="pw1" type="password" placeholder="••••••••" autocomplete="new-password" />
    <label for="pw2">Confirm password</label>
    <input id="pw2" type="password" placeholder="••••••••" autocomplete="new-password" />
    <button id="btn" type="submit">Save new password</button>
  </form>
</div>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  // ====== FILL THESE IN ======
  // Supabase → Project Settings → API → copy the "anon public" key below.
  var SUPABASE_URL = "https://alldcvtfohwqtaalebxr.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsbGRjdnRmb2h3cXRhYWxlYnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4MTMwNTIsImV4cCI6MjEwNjM4OTA1Mn0.mTd03cClNNuJy---G6RSt5oGKWo7pC4V5ka92N86ED0";
  // ===========================

  var msg = document.getElementById("msg");
  var form = document.getElementById("form");
  var btn = document.getElementById("btn");

  function show(text, kind) {
    msg.className = "msg " + kind;
    msg.textContent = text;
  }

  (async function () {
    var params = new URLSearchParams(window.location.search);
    var token_hash = params.get("token_hash");
    var type = params.get("type");

    if (!token_hash || !type) {
      show("This reset link is invalid or expired. Go back to the app and tap \"Forgot password?\" again to get a fresh link.", "err");
      return;
    }
    if (SUPABASE_ANON_KEY.indexOf("PASTE_YOUR") === 0) {
      show("This page isn't configured yet (missing API key).", "err");
      return;
    }

    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    var res = await supabase.auth.verifyOtp({ token_hash: token_hash, type: type });
    if (res.error) {
      show("This reset link is invalid or expired. Go back to the app and request a new one.", "err");
      return;
    }

    form.classList.remove("hidden");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var pw1 = document.getElementById("pw1").value;
      var pw2 = document.getElementById("pw2").value;
      if (!pw1 || pw1.length < 6) {
        show("Password must be at least 6 characters.", "err");
        return;
      }
      if (pw1 !== pw2) {
        show("The two passwords don't match.", "err");
        return;
      }
      btn.disabled = true;
      btn.textContent = "Saving…";
      var up = await supabase.auth.updateUser({ password: pw1 });
      if (up.error) {
        show(up.error.message, "err");
        btn.disabled = false;
        btn.textContent = "Save new password";
        return;
      }
      form.classList.add("hidden");
      show("Password updated! Go back to the RouteMax Pro app and sign in with your new password.", "ok");
    });
  })();
</script>
</body>
</html>
