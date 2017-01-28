angular
    .module("App", ['ui.router', 'ngStorage', 'angularUtils.directives.dirPagination'])
    .run(appRun);
appRun.$inject = ['$rootScope', '$localStorage', '$document', '$state', 'parseService'];
function appRun($rootScope, $localStorage, $document, $state, parseService){
    var currentLocation = window.location.href;

    // Parse initialization
    if (currentLocation.indexOf('localhost') > -1 || currentLocation.indexOf('127.0.0.1') > -1 ) {
        //Local setup
        Parse.initialize('myAppId', 'none');
        Parse.serverURL = "http://127.0.0.1:1337/parse";
    } else {
        // Cloud server setup
        Parse.initialize('KRTa39mwa9G4VgqHHQeXBYc7iOJqVrvAxpGfidzC', '5dTrRR4kMumX0NfPjEVtnnxEur2BsHK4Ci9JIDKa');
        Parse.serverURL = 'https://parseapi.back4app.com/';
    }

    if (!$localStorage.ocmWebsite) {
        console.log('Local storage initialized')
        $localStorage.ocmWebsite = {};
    } else {
        console.log('Local storage:', $localStorage.ocmWebsite)
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        var currentUser = parseService.getCurrentUser();
        var targetState = toState.name;

        if (!currentUser){
            if (targetState == 'login') {
                return;
            } else {
                alert('UNAUTHORIZED ACCESS (1)');
                event.preventDefault();
                $state.transitionTo('login');
            }
        } else {
            var type = currentUser.get('type');

            if (type == 'ADMIN') {
                if (targetState == 'login') {
                    console.log('ADMIN USER DETECTED')
                    event.preventDefault();
                    $state.transitionTo('admin-dashboard');
                } else if (targetState.includes('admin-')) {
                    return;
                } else {
                    alert('UNAUTHORIZED ADMIN ACCESS');
                    event.preventDefault();
                    Parse.User.logOut().then(function() {
                        $state.transitionTo('login');
                    });
                }
            } else if (type == 'BRANCH') {
                if (targetState == 'login') {
                    console.log('BRANCH USER DETECTED')
                    event.preventDefault();
                    $state.transitionTo('branch-dashboard');
                } else if (targetState.includes('branch-')) {
                    return;
                } else {
                    alert('UNAUTHORIZED BRANCH ACCESS');
                    event.preventDefault();
                    Parse.User.logOut().then(function() {
                        $state.transitionTo('login');
                    });
                }
            } else {
                Parse.User.logOut().then(function() {
                    if (targetState == 'login') {
                        return;
                    } else {
                        alert('UNAUTHORIZED ACCESS (2)');
                        event.preventDefault();
                        $state.transitionTo('login');
                    }
                });
            }
        }
    });

    $rootScope.$on('$stateChangeSuccess', function(){
        $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
    });

}