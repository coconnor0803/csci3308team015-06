# LearnMaster UAT Plans Lab 11 Part C

## Feature 1: Properly uploading study sets
**Test cases: Should allow the user to upload a set of terms and definitions, and it should be saved in their study sets.**
**Test plans: In order to test for this, we will test locally on the upload set API route that we create, and make sure that we don’t get any errors while uploading the set.**


## Feature 2: Password reset
**Test cases: Should allow the user to reset their password.**
**Test plans: This test should be done on the cloud, where we will ensure that a user’s passwords have been updated in our database. We should also make sure there are no duplicate users.**

## Feature 3: Edit study materials
**Test cases: Should allow the user to go into a study set and edit the information inside. This could be changing a term or definition, or adding and deleting terms in a set.**
**Test plans: This test can be done locally, as we can test against our API route that will update the set. It should keep all unedited terms the same, while updating the correct information that the user would like to add.**