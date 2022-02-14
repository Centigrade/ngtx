## [🏠][home] &nbsp; → &nbsp; **Contributing**

<details>
  <summary>🧭 &nbsp;<b>Related topics</b></summary>

> ### Code of Conduct
>
> Please have a look on our [code of conduct][coc].
>
> ### Building and Testing ngtx
>
> For more information about how to develop ngtx on your machine, have a look on our [developer's guide][dev-doc].

---

</details>

&nbsp;

> This document explains all important bits of developing ngtx. If you are interested in contributing, please read this article before-hand.

# Contributing to [ngtx][github]

First of all, it is important to us that everyone in this community is treated with respect and in a friendly inclusive manner regardless of sex, race, origin, sexual preference, religion, ... you get it. Please be nice and treat each other the same way you wanted to be treated.

> For more details please see our [Code of Conduct][coc].

Since ngtx is still a small product, we try to keep things as simple as possible. We think it shouldn't be hard to start contributing to ngtx, so we do not want to over-engineer processes only for the sake of it. However, if you do know how to improve the workflow, please let us know by creating an issue with the `workflow` label!

You can use whatever IDE you like, however for documentation purposes we target [Visual Studio Code (aka "vscode")][vscode] as IDE.

> For more details on developing ngtx see the [Developer's Guide][dev-doc].

### <a id="overview"></a> Required Tooling and Conventions

The following tooling is **required** when contributing to ngtx and is added to the recommendations list for vscode (it will prompt you to install the extensions once you opened the cloned repository the first time):

- Linting: [Eslint][vscode.ext.eslint],
- Code Formatter: [Prettier][vscode.ext.prettier],
- Spell Checking: [Code Spell Checker][vscode.ext.code-spell-checker]
- Commit Message Convention: [Conventional Commits v1][commit-message-convention]

---

## Submitting a Pull Request ("PR")

Before you submit your Pull Request ("PR") consider the following guidelines:

1. Search GitHub for an open or closed PR that relates to your submission. You don't want to duplicate existing efforts.
2. Be sure that an issue describes the problem you're fixing, or documents the design for the feature you'd like to add. Discussing the design upfront helps to ensure that we're ready to accept your work.
3. Fork the `Centigrade/ngtx` repo.
4. In your forked repository, make your changes in a new git branch:
   `git checkout -b my-fix-branch main`.
5. Create your patch, including appropriate test cases. Follow our [Coding Rules](#overview).
6. Run the full ngtx test suite, as described in the [developer documentation][dev-doc], and ensure that all tests pass.
7. Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit-message-format).
8. Push your branch to GitHub:
   - `git push origin my-fix-branch`
   - In GitHub, send a pull request to `ngtx:main`.

## <a id="code-style-and-formatting"></a> Code Style and Formatting

> All needed [Visual Studio Code][vscode] (aka "vscode") extensions are added as recommendations to the repository. Once you cloned and opened it in vscode, a dialog will ask you whether you want to install the recommended extensions. Please select "yes" in such case.

### Linting

We use [Eslint][vscode.ext.eslint] as code linter for this project. Linting is supposed to ensure a base line of code quality and features best practices while complaining about code that is known to be problematic. While linting is not the answer to all code problems and bad habits, it often helps a lot with basic issues, that can be prevented before it comes to a review.

### Formatting

In order to keep the code visually organized we use [Prettier][vscode.ext.prettier] as our code formatter. Prettier is configured by the `.prettierrc` file that is checked into our repository to ensure the same configurations across all contributors. This will not only help us writing code that can be easily scanned, but also mitigates the risk of merge conflicts coming from code-format only.

### Miscellaneous

We spell check our code and docs with [Code Spell Checker][vscode.ext.code-spell-checker]. This extension is really helpful in cases you mistype something, while being completely unobtrusive in all other cases.

## <a id="commit-message-format"></a> Commit Messages

We want to commit changes in a way that makes it easy understand what a commit changed and (if applicable) why this change was necessary. This ensures a simple process when it comes to creating a change-log from it. To achieve that, we use the [Conventional Commit Message Format][commit-message-convention] to have a consistent history log.

[coc]: CODE_OF_CONDUCT.md
[dev-doc]: docs/DEVELOPER.md
[github]: https://github.com/Centigrade/ngtx
[home]: ./README.md
[stackoverflow]: https://stackoverflow.com/questions/tagged/ngtx
[vscode]: https://code.visualstudio.com
[vscode.ext.eslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[vscode.ext.prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[vscode.ext.code-spell-checker]: https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker
[commit-message-convention]: https://www.conventionalcommits.org/en/v1.0.0/
