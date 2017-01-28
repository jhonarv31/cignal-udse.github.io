angular
    .module('App')
    .config(configure);

configure.$inject = ['$stateProvider', '$urlRouterProvider'];
function configure ($stateProvider, $urlRouterProvider) {
    $stateProvider

         // START SHARED CONFIG
        .state('login', {
            url: '/login',
            templateUrl: 'app/components/shared/views/login.html',
            controller: 'loginCtrl'
        })
        // END SHARED CONFIG



        // START BRANCH CONFIG
        .state('branch-client', {
            url: '/branch-client',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }],
                clients: ['ClientsService', 'branch', function(ClientsService, branch) {
                    return ClientsService.getClients(branch);
                }]
            },
            templateUrl: 'app/components/branch/views/branch-client.html',
            controller: 'branchClientCtrl'
        })
        .state('branch-home', {
            url: '/branch-home',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }],
                clients: ['ClientsService', 'branch', function(ClientsService, branch) {
                    return ClientsService.getClients(branch);
                }],
                inquires: ['InquiresService', 'branch', function(InquiresService, branch) {
                    return InquiresService.getInquires(branch);
                }]
            },
            templateUrl: 'app/components/branch/views/branch-home.html',
            controller: 'branchHomeCtrl'
        })
        .state('branch-inquire', {
            url: '/branch-inquire',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }],
                inquires: ['InquiresService', 'branch', function(InquiresService, branch) {
                    return InquiresService.getInquires(branch);
                }]
            },
            templateUrl: 'app/components/branch/views/branch-inquire.html',
            controller: 'branchInquireCtrl'
        })
        .state('branch-online-transaction', {
            url: '/branch-online-transaction',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }]
            },
            templateUrl: 'app/components/branch/views/branch-online-transaction.html',
            controller: 'branchOnlineTransactionCtrl'
        })
        .state('branch-setting', {
            url: '/branch-setting',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }]
            },
            templateUrl: 'app/components/branch/views/branch-setting.html',
            controller: 'branchSettingCtrl'
        })
        .state('branch-sms', {
            url: '/branch-sms',
            resolve: {
                branch: ['BranchService', function(BranchService) {
                    return BranchService.getBranch();
                }]
            },
            templateUrl: 'app/components/branch/views/branch-sms.html',
            controller: 'branchSmsCtrl'
        })
        // END BRANCH CONFIG



        // START ADMIN CONFIG
        .state('admin-branch-account', {
            url: '/admin-branch-account/:id',
            resolve: {
                branches: ['BranchesService', function(BranchesService) {
                    return BranchesService.getBranches();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-branch-account.html',
            controller: 'adminBranchAccountCtrl'
        })
        .state('admin-branch-branches', {
            url: '/admin-branch-branches',
            resolve: {
                branches: ['BranchesService', function(BranchesService) {
                    return BranchesService.getBranches();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-branch-branches.html',
            controller: 'adminBranchBranchesCtrl'
        })
        .state('admin-branch-database', {
            url: '/admin-branch-database/:id',
            resolve: {
                branches: ['BranchesService', function(BranchesService) {
                    return BranchesService.getBranches();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-branch-database.html',
            controller: 'adminBranchDatabaseCtrl'
        })
        .state('admin-dashboard', {
            url: '/admin-dashboard',
            resolve: {
                branches: ['BranchesService', function(BranchesService) {
                    return BranchesService.getBranches();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-dashboard.html',
            controller: 'adminDashboardCtrl'
        })
        .state('admin-setting', {
            url: '/admin-setting',
            templateUrl: 'app/components/admin/views/admin-setting.html',
            controller: 'adminSettingCtrl'
        })
        .state('admin-website-channel', {
            url: '/admin-website-channel',
            resolve: {
                channels: ['ChannelsService', function(ChannelsService) {
                    return ChannelsService.getChannels();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-website-channel.html',
            controller: 'adminWebsiteChannelCtrl'
        })
        .state('admin-website-event', {
            url: '/admin-website-event',
            resolve: {
                events: ['EventsService', function(EventsService) {
                    return EventsService.getEvents();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-website-event.html',
            controller: 'adminWebsiteEventCtrl'
        })
        .state('admin-website-plan', {
            url: '/admin-website-plan',
            resolve: {
                plans: ['PlansService', function(PlansService) {
                    return PlansService.getPlans();
                }]
            },
            templateUrl: 'app/components/admin/views/admin-website-plan.html',
            controller: 'adminWebsitePlanCtrl'
        })
        // END ADMIN CONFIG

    ;

    $urlRouterProvider.otherwise("/login");
}