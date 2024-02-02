# codewit.us guide to contributing

This document outlines the practices and procedures for contributing to this repository.

## Who can contribute?

For now, contributions will be limited to members of [Dr. Buffardi's research lab](https://learnbyfailure.com/research/).

If you are a user and are experiencing an error (or have a feature request), please [email Dr. Buffardi with as much detail as possible](mailto:kbuffardi@csuchico.edu).

After version 1.0 is released, we may open contributions to more collaborators.

## How to contribute?

Begin by reviewing the [open issues](https://github.com/codewit-us/codewit.us/issues) and identifying which you would like to address. Assign yourself to the issue.

### Branch and Pull

This project follows the "Branch and Pull" model of collaboration. Collaborators should follow these steps when contributing to a new issue:

1. Clone the repository or if you have already done so, pull the latest revisions to the `main` branch
2. Create a feature branch using `git checkout -b my_feature` by using snake case to describe the issue as well as you can with about 1-4 words.
3. Make the edits locally to address the issue and test it thoroughly.
4. Make atomic commits that only add the necessary files and include commit messages that provide succinct descriptions of the *impact* of your change (*how* it changes the product, not *how* you did it). If a commit completes all requirements for the issue, end the commit message with `closes #xx`, where *xx* is replaced with the identifying number of the issue from the open issues link, above. For example, `git commit -m "Describes how to contribute to the project in documentation, closes #1`.
5. When meaningful progress has been made, push your branch to the repository using `git push -u origin my_feature` but using the same branch name as above.

    * New features that change major user interaction (e.g. new pages, urls, etc.) should include commits with updates to the [road map](ROADMAP.md) to create (or update) a markdown section (`## subheader`) and a description of how to interact with that feature, along with a separate paragraph that identifies the files (with relative paths) that operate the functionality, with brief explanations of their responsibilities.
    * If the commit changes the project's DevOps, proper updates should be made to the documentation in [README](README.md).

6. On github, initiate a Pull Request.

    * If changes need to be made, leave the Pull Request open and just push new commits to the same feature branch.

7. Respond to questions and requests made by reviewers.
8. After the Pull Request is either accepted or rejected, delete the branch on github and locally.

### Code Reviews

All pull requests should include at least one code review and another independent verification.

The code review should copy-and-paste the following markdown template and complete it in a thorough review, as adapted from ["Software Engineering at Google" (Winters, Manshreck, & Wright)](https://abseil.io/resources/swe-book/html/toc.html)

```
- [ ] Code correctness - the code behaves in accordance with all of the issue's specifications
- [ ] Comprehensibility - the code is easy to understand and uses comments where appropriate to explain code that is otherwise difficult to understand

    - [ ] Cited - code that originates from other sources have been commented with appropriate citations

- [ ] Consistency - the code adopts style conventions consistent with the rest of the project
- [ ] Test accuracy - automated tests are included which accurately document the specifications and pass the corresponding code. In cases where code is impractical to test, the pull request includes an explanation why in its description.

    - [ ] Test thoroughness - automated tests thoroughly verify the code
```

When the requirement has been met to the reviewer's satisfaction, an `x` should be placed within the checkbox to note that it is accepted. When requirements have not been met, the reviewer should provide **constructive** feedback and/or questions that help the author to address the concerns. 

After the reviewer is satisfied with all the requirements, they should tag (using `@username`) another collaborator to independently verify that the code works in their own environment. The verifier should pull the feature branch locally, run tests, and manually verify that the behavior matches the issue specifications. Similarly, the verifier should provide **constructive* feedback and/or questions if they are uncertain that it meets all of the requirements. Once they are satisfied, they should reply with `✔️ LGTM` to signify "Looks good to me!"

The project owner should then merge the Pull Request and notify all collaborators that the `main` branch has been updated.

