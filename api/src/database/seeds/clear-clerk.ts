import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import * as readline from 'readline';

// Load environment variables
config();

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

if (!CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to get user confirmation
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getClerkCounts() {
  console.log('🔍 Checking Clerk counts...');

  // Get all organizations with pagination
  console.log('\n📊 Organizations:');
  let allOrganizations: any[] = [];
  let orgOffset = 0;
  const orgLimit = 100;

  while (true) {
    const orgsResponse = await clerk.organizations.getOrganizationList({
      limit: orgLimit,
      offset: orgOffset,
    });

    allOrganizations = allOrganizations.concat(orgsResponse.data);

    if (orgsResponse.data.length < orgLimit) {
      break;
    }

    orgOffset += orgLimit;
  }

  console.log(`  Total organizations: ${allOrganizations.length}`);
  allOrganizations.forEach((org, index) => {
    console.log(`  ${index + 1}. ${org.name} (${org.id})`);
  });

  // Get all users with pagination
  console.log('\n📊 Users:');
  let allUsers: any[] = [];
  let userOffset = 0;
  const userLimit = 100;

  while (true) {
    const usersResponse = await clerk.users.getUserList({
      limit: userLimit,
      offset: userOffset,
    });

    allUsers = allUsers.concat(usersResponse.data);

    if (usersResponse.data.length < userLimit) {
      break;
    }

    userOffset += userLimit;
  }

  console.log(`  Total users: ${allUsers.length}`);
  allUsers.forEach((user, index) => {
    const email = user.emailAddresses[0]?.emailAddress || 'No email';
    console.log(`  ${index + 1}. ${email} (${user.id})`);
  });

  return { allOrganizations, allUsers };
}

async function clearClerk(allOrganizations: any[], allUsers: any[]) {
  try {
    console.log('🗑️  Starting Clerk cleanup...');

    // Delete all organizations
    console.log('\n🗑️  Deleting organizations...');
    for (const org of allOrganizations) {
      try {
        console.log(`  🗑️  Deleting organization: ${org.name} (${org.id})`);
        await clerk.organizations.deleteOrganization(org.id);
        console.log(`  ✅ Successfully deleted organization: ${org.name}`);
      } catch (error: any) {
        console.error(
          `  ❌ Error deleting organization ${org.name}:`,
          error.message,
        );
      }
    }

    // Delete all users
    console.log('\n🗑️  Deleting users...');
    for (const user of allUsers) {
      try {
        const email = user.emailAddresses[0]?.emailAddress || 'No email';
        console.log(`  🗑️  Deleting user: ${email} (${user.id})`);
        await clerk.users.deleteUser(user.id);
        console.log(`  ✅ Successfully deleted user: ${email}`);
      } catch (error: any) {
        console.error(`  ❌ Error deleting user ${user.id}:`, error.message);
      }
    }

    console.log('\n🎉 Clerk cleanup completed!');
    console.log(`📊 Deleted ${allOrganizations.length} organizations`);
    console.log(`📊 Deleted ${allUsers.length} users`);
    console.log('\n✨ You can now start fresh with your Clerk setup!');
  } catch (error) {
    console.error('❌ Error during Clerk cleanup:', error);
    process.exit(1);
  }
}

// Main execution
async function main() {
  try {
    // First, get and display counts
    const { allOrganizations, allUsers } = await getClerkCounts();

    console.log('\n' + '='.repeat(60));
    console.log('⚠️  WARNING: This will delete ALL organizations and users!');
    console.log('⚠️  This action cannot be undone.');
    console.log('⚠️  Make sure you have a backup if needed.');
    console.log('='.repeat(60));

    // Check if --force flag is provided
    const forceFlag = process.argv.includes('--force');

    if (forceFlag) {
      console.log('\n🚀 Proceeding with deletion (--force flag detected)...');
      await clearClerk(allOrganizations, allUsers);
    } else {
      // Ask for user confirmation
      const answer = await askQuestion(
        '\n❓ Do you want to proceed with deletion? (yes/no): ',
      );

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\n🚀 Proceeding with deletion...');
        await clearClerk(allOrganizations, allUsers);
      } else {
        console.log('\n❌ Deletion cancelled by user.');
      }
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
  }
}

main();
