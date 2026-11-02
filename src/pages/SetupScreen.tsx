export function SetupScreen() {
  return (
    <div className="login">
      <div className="login-top">
        <img src="/favicon.svg" alt="" width={44} height={44} className="logo" />
        <h1 className="display xl">
          Connect <em>Firebase</em>
        </h1>
        <p className="tagline">Add your Firebase web-app keys to get started.</p>
      </div>
      <ol className="setup-steps">
        <li>
          Copy <code>.env.example</code> to <code>.env</code>
        </li>
        <li>Paste the values from Firebase Console → Project settings → Your apps</li>
        <li>
          Enable <b>Google</b> sign-in and create a <b>Firestore</b> database
        </li>
        <li>
          Restart <code>npm run dev</code>
        </li>
      </ol>
      <small className="fine">See README.md for the full walkthrough.</small>
    </div>
  )
}
