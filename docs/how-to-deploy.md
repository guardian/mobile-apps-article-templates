# How to release your changes

1. When you merge your changes into master, Circle CI should pick them up and run the tests and validations
2. Once that is successful it will build the project committing those changes
3. The updated branch will then be pushed back to the origin `release` branch.
4. The release branch is then used in a Jenkins task to deploy to IOS and Android.

_Note:_ We would like to simplify step 4, but for now talk to @GHaberis.
