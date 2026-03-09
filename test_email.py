import smtplib
from email.mime.text import MIMEText

# --- CONFIGURATION ---
SENDER_EMAIL = "auxecookie@gmail.com"
SENDER_PASSWORD = "wvur qscf vpfb gqrg"
RECIPIENT_EMAIL = "jrtomasva09@gmail.com"

def test_connection():
    print(f"1. Connecting to Gmail using {SENDER_EMAIL}...")
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        print("   -> Connection established. Attempting login...")
        
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        print("   -> ✅ LOGIN SUCCESSFUL! Credentials are correct.")
        
        msg = MIMEText("This is a test from ACSCI-gurado.")
        msg['Subject'] = "Test Email"
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECIPIENT_EMAIL
        
        server.send_message(msg)
        print("   -> ✅ EMAIL SENT! Check your inbox.")
        server.quit()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        print("\nPossible fixes:")
        print("1. Did you use an App Password? (Not your normal password)")
        print("2. Is 2-Step Verification ON?")
        print("3. Are you on a school network? (They might block port 587)")

if __name__ == "__main__":
    test_connection()