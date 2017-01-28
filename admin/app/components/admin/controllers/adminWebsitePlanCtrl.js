angular
    .module("App")
    .controller("adminWebsitePlanCtrl", adminWebsitePlanCtrl);
adminWebsitePlanCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService', 'customService', 'plans'];
function adminWebsitePlanCtrl($scope, $localStorage, $state, uikitService, customService, plans) {
    console.log('adminWebsitePlanCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSubmitting: false };
    $scope.plans = plans;
    $scope.newData = {}, $scope.selectedFile, $scope.selectedFile2, $scope.selectedDelete = {};
    $scope.selectedEdit = {}, $scope.selectedFile3, $scope.selectedFile4;
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

    $scope.onFileSelect3 = function(element) {
        $scope.selectedFile3 = element.files[0];
    };

    $scope.onFileSelect4 = function(element) {
        $scope.selectedFile4 = element.files[0];
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
            name: data.get('name'),
            plan: data.get('plan'),
            image: data.get('image'),
            imageLarge: data.get('imageLarge')
        };
    };



    // ##########################################################
    // ##########################################################
    // USER ACTIONS
    // ##########################################################
    // ##########################################################

    $scope.submit = function() {
        UIkit.modal('#admnpass').show();
    };

    $scope.submitNext = function() {
        if (!$scope.adminPassword) {
            uikitService.notification('Admin password required', 'danger');
        } else if ($scope.adminPassword != $localStorage.ocmWebsite.user.password) {
            uikitService.notification('Incorrect admin password', 'danger');
        } else {
            $scope.loader.isSubmitting = true;

            if ($scope.selectedFile) {

                // Upload image (small)
                var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile);
                parseFile.save().then(function(success) {
                    $scope.newData.image = success;

                    if ($scope.selectedFile2) {
                        // Upload image (large)
                        var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile2);
                        parseFile.save().then(function(success) {
                            $scope.newData.imageLarge = success;
                            addNewPlan();
                        }, function(error) {
                            console.log('Parse.File large', error)
                            uikitService.notification(error.message, 'danger');
                            $scope.loader.isSubmitting = false;
                            $scope.$apply();
                        });
                    } else {
                        addNewPlan();
                    }

                }, function(error) {
                    console.log('Parse.File small', error)
                    uikitService.notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            } else {
                addNewPlan();
            }
        }
    };

    $scope.submit2 = function() {
        $scope.loader.isSubmitting = true;

        if ($scope.selectedFile3 && $scope.selectedFile4) {

            // Upload image (small)
            var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile3);
            parseFile.save().then(function(success) {
                $scope.selectedEdit.image = success;

                // Upload image (large)
                var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile4);
                parseFile.save().then(function(success) {
                    $scope.selectedEdit.imageLarge = success;
                    updatePlan();
                }, function(error) {
                    console.log('Parse.File large', error)
                    uikitService.notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            }, function(error) {
                console.log('Parse.File small', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmitting = false;
                $scope.$apply();
            });

        } else if ($scope.selectedFile3 && !$scope.selectedFile4) {
            // Upload image (small)
            var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile3);
            parseFile.save().then(function(success) {
                $scope.selectedEdit.image = success;
                updatePlan();
            }, function(error) {
                console.log('Parse.File small', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmitting = false;
                $scope.$apply();
            });
        } else if (!$scope.selectedFile3 && $scope.selectedFile4) {
            // Upload image (large)
            var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile4);
            parseFile.save().then(function(success) {
                $scope.selectedEdit.imageLarge = success;
                updatePlan();
            }, function(error) {
                console.log('Parse.File large', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmitting = false;
                $scope.$apply();
            });
        } else {
            updatePlan();
        }
    };

    function addNewPlan() {
        Parse.Cloud.run('addNewPlan', { data: $scope.newData }).then(function(response) {
            uikitService.notification('Add success');
            $state.reload();
        }, function(error) {
            console.log('addNewPlan', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmitting = false;
            $scope.$apply();
        });
    }

    function updatePlan() {
        selectedEditObject.set('name', $scope.selectedEdit.name);
        selectedEditObject.set('plan', $scope.selectedEdit.plan);
        selectedEditObject.set('image', $scope.selectedEdit.image);
        selectedEditObject.set('imageLarge', $scope.selectedEdit.imageLarge);
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
            Parse.Cloud.run('deletePlan', { id: $scope.selectedDelete.id }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deletePlan error', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isDeleting = false;
                $scope.$apply();
            });
        }
    };

}