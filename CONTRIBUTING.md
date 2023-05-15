# How to contribute

## How to start

- Clone the repository and follow the [DOCKER_SETUP](./docs/DOCKER_SETUP.md) or [LOCAL_SETUP](./docs/LOCAL_SETUP.md)
- Pick up a ticket from Jira
- Create a new branch off `develop` following the naming convention below

```bash
# navigate to the project folder
cd game_tournament_platform

# if you just cloned the repo
git fetch origin

# Checkout the develop branch
git checkout develop && git pull

# Create a new branch following the format in thee next section
git checkout -b <branch_name>
```

- When you are done making changes and you want to push run:

```bash
# from the root directory
git add .
git commit -m "<commit-message>"

# If you are pushing for the first time on the branch
# If you type "git push" it will give you the correct command
git push --set-upstream origin <branch_name>

# Otherwise
git push
```

- Before you can create a PR, make sure to run the automated tests:

```bash
# From the root directory

# The parenthesis are used to run the command in a subshell
# so you don't need to cd back to the root directory. Bash only

(cd backend && npm test)
```

- Once you have finished developing and testing the changes, create a merge request (MR) from GitLab.
  - The MR title should be a short description of the changes. Don't leave the default branch name as MR title.
  - By default, it will try to merge into `production`. Make sure you change the destination branch on GitLab while making the MR.
  - In the MR description, make sure to include all the changes you made.
  - At the end of the description, add a new section for the Jira ticket(s) related to your MR in the following format:

```md
...

Jira Tickets:

[AGTW-<ticket_number>] #done <comment>

[AGTW-<ticket_number>] #done <comment>

[AGTW-<ticket_number>] #done <comment>
```

- Assign the MR review to the appropriate team member.
  - If the reviewer requests changes and adds a thread to the MR, implement the appropriate changes and test again before notifying them.
- Once the MR has been approved, repeat!

---

## Development & Testing Process

- Development is done locally, testingis done via automated scripts.
- Follow the [LOCAL_SETUP.md](./docs/LOCAL_SETUP.md) documentation on how to run the code locally
- Once you are done developing and you tested the changes locally, open an MR

## Branch naming convention

**_There are three persistent branches: `production`, `develop`, and `staging`_**

- `production` is where the released code is stored. It must always be functional and secure. The only way to update this branch is through a PR from staging after the codebase has been tested
- `staging` is similar to `production` and it's where the code deployed to the test server resides. This is where all the hard code testing happens. Once all the tests pass, this branch is merged into production. After every code freeze, the `development` branch is merged into this
- `develop` is where all the new features are merged. All the PR made should be merged into these before final testing. During the code freeze, this branch should only be updated with bug fixes

**_New branches:_**

- The branch name should reflect what you are working on to help speed up the reviewing process and creating pipelines:
  - The branch name should reflect what you are working on. For example, if you are working on a feature, the branch name should start with `feature/` (i.e. `feature/name_of_the_feature`).
- All words in the name shall be lowercase and separated by an underscore or dash (i.e. `branch_name` or `branch-name`)
- The branch name itself should be something meaningful but easy to read
- Avoid long names

**_The different categories of branches are:_**

| Software         | Version                       |
| ---------------- | ----------------------------- |
| **new feature**  | `feature/<branch_name>`       |
| **bug fix**      | `bugfix/<branch_name>`        |
| **hot fix**      | `hotfix/<branch_name>`        |
| **docs changes** | `documentation/<branch_name>` |

---

## Merge requests

When making a merge request (MR) make sure to:

- Test your changes.
- Add an appropriate title and description to the MR.
- Squash your commits: there is a checkbox when you make a PR to squash the commits.
- Add a reviewer or notify them directly.
- Wait for the reviewers to approve and merge.

---

## Testing

- All features should have unit tests (jest) and ui tests (cypress - frontend only)
- All tests MUST be located in files that end in `.spec.ts` or `.test.ts`. This is used by the tsconfig to exclude test files from production builds.

### Backend

A [test folder](./backend/apps/src/tests/) has been created where all test files should go. Use `describe(...)` to create a test suite and `it(...)` to create the unit test. Jest is imported globally so there is no need to manually import it

For test that require database queries, use the mock database so that the MongoDB Atlas instance is not affected:

```ts
import { prismaMock } from '../prisma/singleton';
```

This is an example of a test suite:

```ts
import * as request from 'supertest';
import app from '../app';
import { generateAuthToken, generateRefreshToken } from '../auth/jwt';
import { prismaMock } from '../prisma/singleton';
import { testUser } from './data';

const prefix = '/api/auth';

const user = {
    first_name: testUser.first_name,
    last_name: testUser.last_name,
    display_name: testUser.display_name,
    email: testUser.email,
    password: testUser.password,
    confirm_password: testUser.password,
};

describe('POST /api/auth/refresh', () => {
    it('should return status code 400 if no request body is sent', async () => {
        const res = await request(app).post(`${prefix}/refresh`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toMatchObject({
            error: 'token is invalid',
        });
    });

    it('should return status code 401 if email or password is incorrect', async () => {
        const res = await request(app)
            .post(`${prefix}/refresh`)
            .send({ token: 'wrong-token' });

        expect(res.statusCode).toBe(401);
        expect(res.body).toMatchObject({
            error: 'Cannot validate refresh token.',
        });
    });

    it('should return status code 200 if valid credentials are given', async () => {
        const token = generateRefreshToken(user.email);

        const res = await request(app)
            .post(`${prefix}/refresh`)
            .send({ token });

        expect(res.statusCode).toBe(200);
        expect(res.body.auth_token).toBe(generateAuthToken(user.email));
    });
});
```

### Frontend

Coming soon...

---

## Formatting

### Auto Formatter

- Prettier is the formatter implemented in both frontend and backend. The formatting rules are stated in the `.prettierrc` files.
- If you want a file to not be formatted, add it to the `.prettierignore` files.
- There is also the [prettier.sh](./scripts/prettier.sh) script to format automatically.

```bash
# from the root directory

# Format only files that have been changed
./script/prettier.sh

# Format all files, regardless of whether they have been modified
./script/prettier.sh -a # or ./script/prettier.sh --all
```

- In addition to prettier, make sure you have ESLint installed in vscode to view warnings while coding.

### Frontend Formatting Rules

- All component files should start with an uppercase letter and be camelCase'd. The name of the file should be the same as the default exports.
- If the file is a page, the name should be `<Name>Page` (i.e. SignInPage).
- When using async in useEffect, wrap the async function (outside of the useEffect) in a useCallback.
- For styling, make sure it's scalable:
  - Try using `rem` or `em` instead of `px`.
  - Try using `position: flex` instead of `absolute`.
- Use interfaces, types and enums. Do not use `any` unless necessary. Everything should be mapped to an interface or type.
- Delete unused imports. This is very important to decrease the build size.

### Backend Formatting Rules

- Endpoint parameter should be snake_case, not camelCase. Instantiated variables should be camelCase.
  - Example: `const { first_name } = req.params;` & `const firstName = 'first name';`
- Use "const" instead of "let" or "var" if the variable doesn't change.
- Use arrow functions `() => {}` instead of regular functions if you are not using classes.
- Do not instantiate the same variable multiple times.
- Take advantage of ES6 syntax (`map`, `reduce`, `forEach`). It will simplify the logic most of the times.
- Use `for...of` if the block inside the for loop is asynchronous.
