# How to release your changes

1. When you merge your changes into master, Circle CI should pick them up and run the tests and validations
2. Once that is successful it will build the project committing those changes
3. The updated branch will then be pushed back to the origin `release` branch.
4. To release to the iOS and Android repos visit https://iosuiauto.gutools.co.uk and run the tasks 'Deploy latest template release to Android' and 'Deploy latest template release to iOS'. These tasks will update the templates submodule in each respective repo to the latest commit in the mobile-apps-article-templates release branch.
5. If you need to release to the Windows repo pull the pending release branch from the windows-10-app repo and manually copy the directory 'ArticleTemplates' to windows-10-app/Code/TheGuardian.UI.Win/ArticleTemplates and push these changes.

_TODO:_ Revisit step 4/5 and see if there's any reason why we couldn't automatically update iOS/Android.
