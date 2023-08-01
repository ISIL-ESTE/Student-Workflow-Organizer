## Collaboration Guidelines

### [Submitting an Issue](https://opensource.guide/how-to-contribute/#opening-an-issue)

Thank you for your interest in contributing to our project! To ensure effective collaboration, please follow these guidelines:

Before you submit your issue search the [archive](https://github.com/ISIL-ESTE/Student-Workflow-Organizer/issues?utf8=%E2%9C%93&q=is%3Aissue), maybe your question was already answered or you may find some related content.


- **Issue Overview**: Check if a similar issue exists. Provide a clear description of the problem or feature request.
- **Reproduce the Error**: If reporting a bug, provide steps to reproduce it.
- **Related Issues**: Mention any related issues or pull requests.
- **Suggest a Fix**: If possible, propose a solution for the issue.

### [Submitting a Pull Request](https://opensource.guide/how-to-contribute/#opening-a-pull-request)

Before you submit your pull request, consider the following guidelines:

- Search [GitHub](https://github.com/ISIL-ESTE/Student-Workflow-Organizer/pulls?utf8=%E2%9C%93&q=is%3Apr) for an open or closed Pull Request
  that relates to your submission.
- If you want to modify the project code structure, please start a discussion about it first
- Make your changes in a new git branch

  ```shell
  git checkout -b my-fix-branch main
  ```

- Create your patch, **including appropriate test cases**, Note: if you aren't able to create tests, consider adding **need tests** label 
- Commit your changes using a descriptive commit message.

- Push your branch to GitHub:

  ```shell
  git push origin my-fix-branch
  ```

  - In GitHub, send a pull request to `ISIL-ESTE/Student-Workflow-Organizer:main`.
  - if your pr includes multiple tasks and you're not done yet, consider creating a draft pull request with a task list to allow other members to track the issue's progress 
- If we suggest changes, then
  - Make the required updates.
  - Make sure the tests are still passing
  - Rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase main -i
    git push -f
    ```
That's it! Thank you for your contribution!

#### Resolving merge conflicts ("This branch has conflicts that must be resolved")

Sometimes your PR will have merge conflicts with the upstream repository's main branch. There are several ways to solve this but if not done correctly this can end up as a true nightmare. So here is one method that works quite well.

- First, fetch the latest information from the main

  ```shell
  git fetch upstream
  ```

- Rebase your branch against the upstream/main

  ```shell
  git rebase upstream/main
  ```

- Git will stop rebasing at the first merge conflict and indicate which file is in conflict. Edit the file, resolve the conflict then 

  ```shell
  git add <the file that was in conflict>
  git rebase --continue
  ```
- The rebase will continue up to the next conflict. Repeat the previous step until all files are merged and the rebase ends successfully.
- Force push to your GitHub repository (this will update your Pull Request)

  ```shell
  git push -f
  ```



  #### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

  ```shell
  git push origin --delete my-fix-branch
  ```

- Check out the main branch:

  ```shell
  git checkout main -f
  ```

- Delete the local branch:

  ```shell
  git branch -D my-fix-branch
  ```

- Update your main with the latest upstream version:

  ```shell
  git pull --ff upstream main
  ```
