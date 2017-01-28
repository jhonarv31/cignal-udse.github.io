angular
    .module("App")
    .controller("adminWebsiteChannelCtrl", adminWebsiteChannelCtrl);
adminWebsiteChannelCtrl.$inject = ['$scope', '$localStorage', '$state', 'uikitService', 'customService', 'channels'];
function adminWebsiteChannelCtrl($scope, $localStorage, $state, uikitService, customService, channels) {
    console.log('adminWebsiteChannelCtrl')

    // ##########################################################
    // ##########################################################
    // INITIALIZATION
    // ##########################################################
    // ##########################################################

    // Models
    $scope.loader = { isSubmitting: false };
    $scope.channels = channels;
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
            name: data.get('name'),
            type: data.get('type'),
            image: data.get('image')
        };
        console.log($scope.selectedEdit)
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

                // Upload image
                var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile);
                parseFile.save().then(function(success) {
                    $scope.newData.image = success;
                    addNewChannel();
                }, function(error) {
                    console.log('Parse.File', error)
                    uikitService.notification(error.message, 'danger');
                    $scope.loader.isSubmitting = false;
                    $scope.$apply();
                });

            } else {
                addNewChannel();
            }
        }
    };

    $scope.submit2 = function() {
        $scope.loader.isSubmitting = true;

        if ($scope.selectedFile2) {

            // Upload image
            var parseFile = new Parse.File(customService.randomCharacters(20), $scope.selectedFile2);
            parseFile.save().then(function(success) {
                $scope.selectedEdit.image = success;
                updateChannel();
            }, function(error) {
                console.log('Parse.File', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isSubmitting = false;
                $scope.$apply();
            });

        } else {
            updateChannel();
        }
    };

    function addNewChannel() {
        Parse.Cloud.run('addNewChannel', { data: $scope.newData }).then(function(response) {
            uikitService.notification('Add success');
            $state.reload();
        }, function(error) {
            console.log('addNewChannel', error)
            uikitService.notification(error.message, 'danger');
            $scope.loader.isSubmitting = false;
            $scope.$apply();
        });
    }

    function updateChannel() {
        selectedEditObject.set('name', $scope.selectedEdit.name);
        selectedEditObject.set('type', $scope.selectedEdit.type);
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
            Parse.Cloud.run('deleteChannel', { id: $scope.selectedDelete.id }).then(function(response) {
                uikitService.notification('Delete success');
                $state.reload();
            }, function(error) {
                console.log('deleteChannel error', error)
                uikitService.notification(error.message, 'danger');
                $scope.loader.isDeleting = false;
                $scope.$apply();
            });
        }
    };

}