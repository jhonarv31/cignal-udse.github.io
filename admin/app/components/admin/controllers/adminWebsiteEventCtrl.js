angular
    .module("App")
    .controller("adminWebsiteEventCtrl", adminWebsiteEventCtrl);
adminWebsiteEventCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService', 'customService', 'events'];
function adminWebsiteEventCtrl($scope, $localStorage, $state, uikitService, customService, events) {
    console.log('adminWebsiteEventCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSubmitting: false };
    $scope.events = events;
    $scope.newData = {}, $scope.selectedFile, $scope.selectedDelete = {};
    $scope.selectedEdit = {}, $scope.selectedFile2;
    $scope.adminPassword = '';
    $scope.submitEnter = customService.enterEvent;

    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    // Local
    var selectedEditObject;



    // ##########################################################
    // ##########################################################
    // CONTROLLER FUNCTIONS
    // ##########################################################
    // ##########################################################

    $scope.onFileSelect = function(element) {
        $scope.selectedFile = element.files[0];
    };

    $scope.onFileSelect2 = function(element) {
        $scope.selectedFile2 = element.files[0];
    };

    $scope.formatDate = function(data) {
        return customService.dateFormat1(data);
    };

    $scope.setDelete = function(data) {
        $scope.selectedDelete = data;
    };

    $scope.setEdit = function(data) {
        selectedEditObject = data;
        $scope.selectedEdit = {
            title: data.get('title'),
            description: data.get('description'),
            image: data.get('image')
        };
    };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.submit = function() {
        if (!$scope.newData.title) {
            uikitService.notification('Title required', 'danger');
        } else if (!$scope.newData.description) {
            uikitService.notification('Description required', 'danger');
        } else {
            UIkit.modal('#admnpass').show();
        }
    };

    $scope.submitNext = function() {
        if (!$scope.adminPassword) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {
            $scope.loader.isSubmitting = true;

            if ($scope.selectedFile) {

                // Upload image
                var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile);
                parseFile.save().then(function(success) {
                    $scope.newData.image = success;
                    addNewPost();
                }, function(error) {
                    console.log('Parse.File', error)
                    uikitService.notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            } else {
                addNewPost();
            }
        }
    };

    $scope.submit2 = function() {
        if (!$scope.selectedEdit.title) {
            uikitService.notification('Title required', 'danger');
        } else if (!$scope.selectedEdit.description) {
            uikitService.notification('Description required', 'danger');
        } else {
            $scope.loader.isSubmitting = true;

            if ($scope.selectedFile2) {

                // Upload image
                var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile2);
                parseFile.save().then(function(success) {
                    $scope.selectedEdit.image = success;
                    updatePost();
                }, function(error) {
                    console.log('Parse.File', error)
                    uikitService.notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            } else {
                updatePost();
            }
        }
    };

    function addNewPost() {
        Parse.Cloud.run('addNewPost', { data: $scope.newData }).then(function(response) {
            uikitService.notification('Add success');
            $state.reload();
        }, function(error) {
            console.log('addNewBranch', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmitting = false;
            $scope.$apply();
        });
    }

    function updatePost() {
        selectedEditObject.set('title', $scope.selectedEdit.title);
        selectedEditObject.set('description', $scope.selectedEdit.description);
        selectedEditObject.set('image', $scope.selectedEdit.image);
        selectedEditObject.save().then(function() {
            uikitService.notification('Update success');
            $state.reload();
        }, function(error) {
            console.log('selectedEdit.save', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmitting = false;
            $scope.$apply();
        });
    }

    $scope.delete = function() {
        if (!$scope.adminPassword2) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword2 != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {
            $scope.loader.isDeleting = true;
            Parse.Cloud.run('deletePost', { id: $scope.selectedDelete.id }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deletePost error', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isDeleting = false;
                $scope.$apply();
            });
        }
    };

}