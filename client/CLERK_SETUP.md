# Clerk Frontend Authentication Setup

This guide will help you set up Clerk authentication for your React frontend application.

## Prerequisites

- A Clerk account and application set up
- Your backend API with Clerk authentication already configured
- The frontend application running with Vite

## Setup Steps

### 1. Environment Variables

Update your `client/.env` file with your Clerk publishable key:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:3501
```

**Important**: Replace `pk_test_your_publishable_key_here` with your actual Clerk publishable key from your Clerk dashboard.

### 2. Get Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to **API Keys** section
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)

### 3. Configure Clerk Application Settings

In your Clerk dashboard:

1. Go to **User & Authentication** → **Email, Phone, Username**
2. Configure your preferred sign-in methods
3. Go to **Paths** and set:
   - **Sign in URL**: `http://localhost:5173/sign-in`
   - **Sign up URL**: `http://localhost:5173/sign-up`
   - **After sign in URL**: `http://localhost:5173/`
   - **After sign up URL**: `http://localhost:5173/`

### 4. Start the Application

```bash
cd client
bun run start:dev
```

## Features Implemented

### Authentication Components

- **SignInPage**: Custom styled sign-in form
- **SignUpPage**: Custom styled sign-up form
- **ProtectedRoute**: Route guard for authenticated pages
- **UserButton**: User profile and sign-out functionality

### API Integration

- **useApi Hook**: Custom hook for making authenticated API calls
- Automatic token inclusion in API requests
- Error handling for API failures

### Protected Routes

All main application routes are now protected:

- `/` - Dashboard
- `/patients` - Patients management
- `/appointments` - Appointments
- `/vital-signs` - Vital signs
- `/medical-records` - Medical records
- `/health-monitor` - Health monitoring

Public routes:

- `/sign-in` - Sign in page
- `/sign-up` - Sign up page

## Usage Examples

### Making Authenticated API Calls

```typescript
import { useApi } from "@/hooks/useApi";

function MyComponent() {
  const { apiCall } = useApi();

  const fetchData = async () => {
    try {
      const data = await apiCall("/patients");
      console.log(data);
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  // ... rest of component
}
```

### Accessing User Information

```typescript
import { useUser } from "@clerk/clerk-react";

function MyComponent() {
  const { user } = useUser();

  return (
    <div>
      <p>Welcome, {user?.fullName}!</p>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
    </div>
  );
}
```

### Checking Authentication Status

```typescript
import { useAuth } from "@clerk/clerk-react";

function MyComponent() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome to the dashboard!</div>;
}
```

## Customization

### Styling Authentication Forms

You can customize the appearance of Clerk components by modifying the `appearance` prop in the SignIn and SignUp components:

```typescript
<SignIn
  appearance={{
    elements: {
      formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
      card: "shadow-none",
      headerTitle: "hidden",
      headerSubtitle: "hidden",
    },
  }}
/>
```

### Adding Custom User Profile

The UserButton component can be extended to include additional user information or actions:

```typescript
import { useUser } from "@clerk/clerk-react";

function CustomUserButton() {
  const { user } = useUser();

  return (
    <div>
      <span>{user?.fullName}</span>
      <UserButton />
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Missing Publishable Key" Error**

   - Ensure your `.env` file has the correct `VITE_CLERK_PUBLISHABLE_KEY`
   - Restart your development server after updating environment variables

2. **API Calls Failing**

   - Check that your backend is running on the correct port
   - Verify that the `VITE_API_URL` is correct
   - Ensure your backend is properly configured with Clerk authentication

3. **Authentication Not Working**
   - Check Clerk dashboard settings for correct redirect URLs
   - Verify that your Clerk application is in the correct mode (test/live)
   - Check browser console for any error messages

### Development vs Production

For production deployment:

1. Update environment variables with production keys
2. Configure production URLs in Clerk dashboard
3. Update `VITE_API_URL` to your production API endpoint
4. Ensure HTTPS is enabled for production

## Security Notes

- Never commit your Clerk keys to version control
- Use environment variables for all sensitive configuration
- Always use HTTPS in production
- Regularly rotate your API keys
- Monitor authentication events in Clerk dashboard

## Next Steps

1. **Test the authentication flow** by signing up and signing in
2. **Customize the UI** to match your application's design
3. **Add role-based access control** if needed
4. **Implement additional security measures** like session management
5. **Set up production deployment** with proper environment variables
