export const LandingContainer: React.FC = ({children}) => (
  <div className="landing">{children}</div>
)
export const WelcomeContainer: React.FC<{isMember: boolean}> = ({isMember}) => (
  <h2>
    {!isMember
      ? 'Bienvenue au  AfroBuildersDAO <✊🏿,💻 />'
      : '<✊🏿, 💻 /> Member Page'}
  </h2>
)
