// LOCAL VARIABLE
var TWILIO_CLIENT, TWILIO_FROM;



// START CONFIG
Parse.Config.get().then(function(config) {
    var accountSid = config.get("TWILIO_ACCOUNT_SID");
    var authToken = config.get("TWILIO_AUTH_TOKEN");
    TWILIO_CLIENT = require('twilio')(accountSid, authToken);
    TWILIO_FROM = config.get("TWILIO_FROM");
}, function(error) {
    console.log('Parse.Config error', error)
});
// END CONFIG



// START INQUIRE BRANCH FUNCTIONS
Parse.Cloud.define('addNewInquire', function(req, res) {
    console.log('addNewInquire')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    if (data.date)
        data.date = new Date(data.date);

    if (data.type == 'INQUIRE') {
        console.log('type is INQUIRE')
        var Inquire = Parse.Object.extend("Inquire");
        var inquire = new Inquire();
        inquire.save(data, {
            success: function(object) {
                console.log('addNewInquire done')
                res.success({ success: true });
            },
            error: function(error) {
                console.log('addNewInquire error')
                res.error(error);
            }
        });
    } else {
        console.log('type is not INQUIRE')

        // check if name exists in client
        getClientByName(data.name).first({
            success: function(result) {
                console.log('getClientByName done')
                if (result) {
                    // if exist return error
                    res.error('Client is already in the list.');
                } else {
                    // if not add new data to client and transaction
                    var clientData = {
                        name: data.name,
                        email: data.email,
                        contact: data.contact,
                        address: data.address,
                        branchPointer: data.branchPointer
                    };

                    var Client = Parse.Object.extend("Client");
                    var client = new Client();
                    client.save(clientData, {
                        success: function(object) {
                            console.log('addNewClient done')

                            var transactionData = {
                                type: data.type,
                                plan: data.plan,
                                postpaid: data.postpaid,
                                amount: data.amount,
                                ar: data.ar,
                                date: data.date,
                                remarks: data.remarks,
                                clientPointer: object,
                                branchPointer: data.branchPointer
                            };

                            var Transaction = Parse.Object.extend("Transaction");
                            var transaction = new Transaction();
                            transaction.save(transactionData, {
                                success: function(object) {
                                    console.log('addNewTransaction done')
                                    res.success({ success: true });
                                },
                                error: function(error) {
                                    console.log('addNewTransaction error')
                                    res.error(error);
                                }
                            });

                        },
                        error: function(error) {
                            console.log('addNewClient error')
                            res.error(error);
                        }
                    });
                }
            },
            error: function(error) {
                console.log('getClientByName error', error)
                res.error(error);
            }
        });
    }
});
Parse.Cloud.define('deleteInquire', function(req, res) {
    console.log('deleteInquire')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getInquireById(id).first({
        success: function(result) {
            console.log('getInquireById done')

            result.destroy({
                success: function() {
                    console.log('deleteInquire done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deleteInquire error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getInquireById error', error)
            res.error(error);
        }
    });
});
Parse.Cloud.define('deleteInquireAddClient', function(req, res) {
    console.log('deleteInquireAddClient')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getInquireById(id).first({
        success: function(result) {
            console.log('getInquireById done')
            var inquirePointer = result;

            // create new Client
            var Client = Parse.Object.extend("Client");
            var client = new Client();
            client.set('firstname', result.get('firstname'));
            client.set('middlename', result.get('middlename'));
            client.set('lastname', result.get('lastname'));
            client.set('email', result.get('email'));
            client.set('contact', result.get('contact'));
            client.set('address', result.get('address'));
            client.set('userPointer', result.get('userPointer'));
            client.set('branchPointer', result.get('branchPointer'));
            client.save(null, {
                success: function() {
                    console.log('client.save done')

                    // delete inquire
                    inquirePointer.destroy({
                        success: function() {
                            console.log('deleteInquireAddClient done')
                            res.success({success: true});
                        },
                        error: function(error) {
                            console.log('deleteInquireAddClient error', error)
                            res.error(error);
                        }
                    });
                },
                error: function(error) {
                    console.log('client.save error')
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getInquireById error', error)
            res.error(error);
        }
    });
});
// END INQUIRE BRANCH FUNCTIONS



// START TRANSACTION FUNCTIONS
Parse.Cloud.define('addNewTransaction', function(req, res) {
    console.log('addNewTransaction')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    var Transaction = Parse.Object.extend("Transaction");
    var transaction = new Transaction();
    transaction.save(data, {
        success: function(object) {
            console.log('addNewTransaction done')
            res.success({ success: true });
        },
        error: function(error) {
            console.log('addNewTransaction error')
            res.error(error);
        }
    });
});
// END TRANSACTION FUNCTIONS



// START ADMIN BRANCH FUNCTIONS
Parse.Cloud.define('addNewBranch', function(req, res) {
    console.log('addNewBranch')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var account = params.account;
    var data = params.data;

    // Check username existence
    getUserObjectByUsername(account.username).first({
        success: function(result) {
            console.log('getUserObjectByUsername done')

            if (result) {
                res.error('USERNAME IS ALREADY USED');
            } else {

                // New account for branch
                var user = new Parse.User();
                user.set("username", account.username);
                user.set("password", account.password);
                user.set("type", "BRANCH");
                user.signUp(null, {
                    success: function(user) {
                        // Set branch's user pointer
                        data.userPointer = user;

                        // New branch object
                        var Branch = Parse.Object.extend("Branch");
                        var branch = new Branch();
                        branch.save(data, {
                            success: function(object) {
                                console.log('addNewBranch done')
                                res.success({ success: true });
                            },
                            error: function(error) {
                                console.log('addNewBranch error')
                                res.error(error);
                            }
                        });

                    },
                    error: function(error) {
                        console.log('user.signUp error')
                        res.error(error);
                    }
                });
            }
        },
        error: function(error) {
            console.log('getUserObjectByUsername error')
            res.error(error);
        }
    });
});
Parse.Cloud.define('deleteBranch', function(req, res) {
    console.log('deleteBranch')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getBranchById(id).first({
        success: function(result) {
            console.log('getBranchById done')
            var branchPointer = result;

            // delete user pointer
            var userPointer = branchPointer.get('userPointer');
            userPointer.destroy({
                success: function() {
                    console.log('deleteUser done')

                    // delete branch
                    branchPointer.destroy({
                        success: function() {
                            console.log('deleteBranch done')
                            res.success({success: true});
                        },
                        error: function(error) {
                            console.log('deleteBranch error', error)
                            res.error(error);
                        }
                    });

                },
                error: function(error) {
                    console.log('deleteUser error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getBranchById error', error)
            res.error(error);
        }
    });
});
Parse.Cloud.define('updateBranchUser', function(req, res) {
    console.log('updateBranchUser')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var userId = params.userId;
    var password = params.password;

    getUserObjectById(userId).first({
        success: function(result) {
            console.log('getUserObjectById done')
            var userPointer = result;

            userPointer.set('password', password);
            userPointer.save().then(function() {
                console.log('updateBranchUser done')
                res.success({ success: true });
            }, function(error) {
                console.log('updateBranchUser error', error)
                res.error(error);
            });
        },
        error: function(error) {
            console.log('getUserObjectById error', error)
            res.error(error);
        }
    });
});
Parse.Cloud.define('updateBranchQuota', function(req, res) {
    console.log('updateBranchQuota')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;
    var quota = params.quota;

    getBranchById(id).first({
        success: function(result) {
            console.log('getBranchById done')

            result.set('quota', quota);
            result.save().then(function() {
                console.log('updateBranchQuota done')
                res.success({ success: true });
            }, function(error) {
                console.log('updateBranchQuota error', error)
                res.error(error);
            });
        },
        error: function(error) {
            console.log('getBranchById error', error)
            res.error(error);
        }
    });
});
// END ADMIN BRANCH FUNCTIONS



// START ADMIN MONITOR FUNCTIONS
Parse.Cloud.define('getAllBranchData', function(req, res) {
    console.log('getAllBranchData')
    Parse.Cloud.useMasterKey();

    // get all branch
    var classObject = Parse.Object.extend("Branch");
    var query = new Parse.Query(classObject);
    query.find({
        success: function(results) {
            var counter = 0;
            var finalData = results;

            for (var i = 0; i < results.length; i++) {
                (function(i) {
                    var counter2 = 0;
                    var currentBranchPointer = results[i];

                    // get clients count
                    var Client = Parse.Object.extend("Client");
                    var client = new Parse.Query(Client);
                    client.equalTo("branchPointer", currentBranchPointer);
                    client.find({
                        success: function(results) {
                            counter2++;
                            finalData[i].clients = results;
                            if (counter2 == 4) {
                                counter++;
                                getAllBranchDataDone(res, finalData, counter);
                            }
                        },
                        error: function(error) {
                            console.log('get clients count error')
                            res.error(error);
                        }
                    });

                    // get inquires count
                    var Inquire = Parse.Object.extend("Inquire");
                    var inquire = new Parse.Query(Inquire);
                    inquire.equalTo("branchPointer", currentBranchPointer);
                    inquire.find({
                        success: function(results) {
                            counter2++;
                            finalData[i].inquires = results;
                            if (counter2 == 4) {
                                counter++;
                                getAllBranchDataDone(res, finalData, counter);
                            }
                        },
                        error: function(error) {
                            console.log('get inquires count error')
                            res.error(error);
                        }
                    });

                    // get pre-reg pending count
                    var User = Parse.Object.extend("User");
                    var user = new Parse.Query(User);
                    user.equalTo("branchPointer", currentBranchPointer);
                    user.equalTo("status", "PENDING");
                    user.find({
                        success: function(results) {
                            counter2++;
                            finalData[i].users = results;
                            if (counter2 == 4) {
                                counter++;
                                getAllBranchDataDone(res, finalData, counter);
                            }
                        },
                        error: function(error) {
                            console.log('get pre-reg pending count error')
                            res.error(error);
                        }
                    });

                    // get reservations count
                    var Reservation = Parse.Object.extend("Reservation");
                    var reservation = new Parse.Query(Reservation);
                    reservation.equalTo("branchPointer", currentBranchPointer);
                    reservation.find({
                        success: function(results) {
                            counter2++;
                            finalData[i].reservations = results;
                            if (counter2 == 4) {
                                counter++;
                                getAllBranchDataDone(res, finalData, counter);
                            }
                        },
                        error: function(error) {
                            console.log('get reservations count error')
                            res.error(error);
                        }
                    });

                }(i));
            }

        },
        error: function(error) {
            console.log('get all branch error')
            res.error(error);
        }
    });

});
function getAllBranchDataDone(res, finalData, counter) {
    if (finalData.length == counter) {
        var temp = [];
        for (var i = 0; i < finalData.length; i++) {
            temp[i] = {};
            temp[i].branch = finalData[i];
            temp[i].clients = finalData[i].clients;
            temp[i].inquires = finalData[i].inquires;
            temp[i].reservations = finalData[i].reservations;
            temp[i].users = finalData[i].users;
        }
        res.success(temp);
    }
}
// END ADMIN MONITOR FUNCTIONS



// START POST FUNCTIONS
Parse.Cloud.define('addNewPost', function(req, res) {
    console.log('addNewPost')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    // New post object
    var Post = Parse.Object.extend("Post");
    var post = new Post();
    post.save(data, {
        success: function(object) {
            console.log('addNewPost done')
            res.success({ success: true });
        },
        error: function(error) {
            console.log('addNewPost error')
            res.error(error);
        }
    });
});
Parse.Cloud.define('deletePost', function(req, res) {
    console.log('deletePost')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getPostById(id).first({
        success: function(result) {
            console.log('getPostById done')

            result.destroy({
                success: function() {
                    console.log('deletePost done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deletePost error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getPostById error', error)
            res.error(error);
        }
    });
});
// END POST FUNCTIONS



// START CHANNEL FUNCTIONS
Parse.Cloud.define('addNewChannel', function(req, res) {
    console.log('addNewChannel')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    // New post object
    var Channel = Parse.Object.extend("Channel");
    var channel = new Channel();
    channel.save(data, {
        success: function(object) {
            console.log('addNewChannel done')
            res.success({ success: true });
        },
        error: function(error) {
            console.log('addNewChannel error')
            res.error(error);
        }
    });
});
Parse.Cloud.define('deleteChannel', function(req, res) {
    console.log('deleteChannel')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getChannelById(id).first({
        success: function(result) {
            console.log('getChannelById done')

            result.destroy({
                success: function() {
                    console.log('deleteChannel done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deleteChannel error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getChannelById error', error)
            res.error(error);
        }
    });
});
// END CHANNEL FUNCTIONS



// START PLAN FUNCTIONS
Parse.Cloud.define('addNewPlan', function(req, res) {
    console.log('addNewPlan')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    // New post object
    var Plan = Parse.Object.extend("Plan");
    var plan = new Plan();
    plan.save(data, {
        success: function(object) {
            console.log('addNewPlan done')
            res.success({ success: true });
        },
        error: function(error) {
            console.log('addNewPlan error')
            res.error(error);
        }
    });
});
Parse.Cloud.define('deletePlan', function(req, res) {
    console.log('deletePlan')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getPlanById(id).first({
        success: function(result) {
            console.log('getPlanById done')

            result.destroy({
                success: function() {
                    console.log('deletePlan done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deletePlan error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getPlanById error', error)
            res.error(error);
        }
    });
});
// END PLAN FUNCTIONS



// START SMS FUNCTIONS
Parse.Cloud.define('sendSms', function(req, res) {
    console.log('sendSms')

    var params = req.params;
    var data = params.data;

    TWILIO_CLIENT.messages.create({
        to: data.to,
        from: TWILIO_FROM,
        body: data.body,
    }, function (err, message) {
        if (err)
            res.error(err.message);
        else {
            console.log('sendSms done')
            res.success(message);
        }
    });
});
// END SMS FUNCTIONS



// START RESERVATION FUNCTIONS
Parse.Cloud.define('getReservations', function(req, res) {
    console.log('getReservations')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var branchPointer = params.branchPointer;
    var status = params.status;

    getReservationByBranchPointer(branchPointer, status).find({
        success: function(results) {
            console.log('getReservations done')
            res.success(results);
        },
        error: function(error) {
            console.log('getReservations error', error)
            res.error(error);
        }
    });

});
Parse.Cloud.define('getReservationsNotDone', function(req, res) {
    console.log('getReservationsNotDone')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var branchPointer = params.branchPointer;

    getReservationNotDone(branchPointer).find({
        success: function(results) {
            console.log('getReservationNotDone done')
            res.success(results);
        },
        error: function(error) {
            console.log('getReservationNotDone error', error)
            res.error(error);
        }
    });

});
Parse.Cloud.define('addNewReservation', function(req, res) {
    console.log('addNewReservation')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;
    var userId = params.userId;

    getUserObjectById(userId).first({
        success: function(result) {
            console.log('getUserObjectById done')
            var userPointer = result;
            data.userPointer = result;
            data.branchPointer = result.get('branchPointer');

            // New reservation object
            var Reservation = Parse.Object.extend("Reservation");
            var reservation = new Reservation();
            reservation.save(data, {
                success: function(object) {

                    // Check if account has inquire object
                    getInquireByUserPointer(userPointer).first({
                        success: function(result) {
                            console.log('getInquireByUserPointer done')
                            var inquirePointer = result;

                            if (inquirePointer) {
                                // New client object
                                var Client = Parse.Object.extend("Client");
                                var client = new Client();
                                client.set('name', userPointer.get('name'));
                                client.set('email', userPointer.get('email'));
                                client.set('contact', userPointer.get('contact'));
                                client.set('address', userPointer.get('address'));
                                client.set('branchPointer', userPointer.get('branchPointer'));
                                client.set('userPointer', userPointer);
                                client.save(null, {
                                    success: function() {
                                        console.log('client.save done')

                                        // delete inquire
                                        inquirePointer.destroy({
                                            success: function() {
                                                console.log('addNewReservation done')
                                                res.success({ success: true });
                                            },
                                            error: function(error) {
                                                console.log('deleteInquireAddClient error', error)
                                                res.error(error);
                                            }
                                        });

                                    },
                                    error: function(error) {
                                        console.log('client.save error')
                                        res.error(error);
                                    }
                                });
                            } else {
                                console.log('no inquire pointer, addNewReservation done')
                                res.success({ success: true });
                            }

                        },
                        error: function(error) {
                            console.log('getInquireByUserPointer error', error)
                            res.error(error);
                        }
                    });

                },
                error: function(error) {
                    console.log('addNewReservation error')
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getUserObjectById error', error)
            res.error(error);
        }
    });
});
Parse.Cloud.define('deleteReservation', function(req, res) {
    console.log('deleteReservation')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getReservationById(id).first({
        success: function(result) {
            console.log('getReservationById done')

            result.destroy({
                success: function() {
                    console.log('deleteReservation done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deleteReservation error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getReservationById error', error)
            res.error(error);
        }
    });
});
// END RESERVATION FUNCTIONS



// START CUSTOMER SERVICE FUNCTIONS
Parse.Cloud.define('getCustomerServices', function(req, res) {
    console.log('getCustomerServices')
    Parse.Cloud.useMasterKey();

    getCustomerServices().find({
        success: function(results) {
            console.log('getCustomerServices done')
            res.success(results);
        },
        error: function(error) {
            console.log('getCustomerServices error', error)
            res.error(error);
        }
    });

});
Parse.Cloud.define('addNewCustomerService', function(req, res) {
    console.log('addNewCustomerService')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var data = params.data;

    // New client object
    var CustomerService = Parse.Object.extend("CustomerService");
    var customerService = new CustomerService();
    customerService.save(data, {
        success: function(object) {
            console.log('addNewCustomerService done')
            res.success({ success: true });
        },
        error: function(error) {
            console.log('addNewCustomerService error')
            res.error(error);
        }
    });
});
Parse.Cloud.define('deleteCustomerService', function(req, res) {
    console.log('deleteCustomerService')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var id = params.id;

    getCustomerServiceById(id).first({
        success: function(result) {
            console.log('getCustomerServiceById done')

            result.destroy({
                success: function() {
                    console.log('deleteCustomerService done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deleteCustomerService error', error)
                    res.error(error);
                }
            });

        },
        error: function(error) {
            console.log('getCustomerServiceById error', error)
            res.error(error);
        }
    });
});
// END CUSTOMER SERVICE FUNCTIONS



// START PRE-REGISTRATION FUNCTIONS
Parse.Cloud.define('getPreregistrations', function(req, res) {
    console.log('getPreregistrations')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var branchPointer = params.branchPointer;

    getUsersByBranchAndStatus(branchPointer, 'PENDING').find({
        success: function(results) {
            console.log('getPreregistrations done')
            res.success(results);
        },
        error: function(error) {
            console.log('getPreregistrations error', error)
            res.error(error);
        }
    });

});
Parse.Cloud.define('approvePreregistration', function(req, res) {
    console.log('approvePreregistration')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var userId = params.userId;

    getUserObjectById(userId).first({
        success: function(result) {
            console.log('getUserObjectById done')
            var userPointer = result;

            userPointer.set('status', 'APPROVED');
            userPointer.save().then(function(result) {

                // create new inquire
                var Inquire = Parse.Object.extend("Inquire");
                var inquire = new Inquire();
                inquire.set('lastname', result.get('lastname'));
                inquire.set('firstname', result.get('firstname'));
                inquire.set('middlename', result.get('middlename'));
                inquire.set('email', result.get('email'));
                inquire.set('contact', result.get('contact'));
                inquire.set('address', result.get('address'));
                inquire.set('branchPointer', result.get('branchPointer'));
                inquire.set('userPointer', result);
                inquire.set('registration', 'ONLINE');
                inquire.save(null, {
                    success: function(object) {
                        console.log('addNewInquire done')
                        res.success({ success: true });
                    },
                    error: function(error) {
                        console.log('addNewInquire error')
                        res.error(error);
                    }
                });

                console.log('approvePreregistration done')
                res.success({ success: true });
            }, function(error) {
                console.log('approvePreregistration error', error)
                res.error(error);
            });
        },
        error: function(error) {
            console.log('getUserObjectById error', error)
            res.error(error);
        }
    });
});
Parse.Cloud.define('deletePreregistration', function(req, res) {
    console.log('deletePreregistration')
    Parse.Cloud.useMasterKey();

    var params = req.params;
    var userId = params.userId;

    getUserObjectById(userId).first({
        success: function(result) {
            console.log('getUserObjectById done')
            var userPointer = result;

            userPointer.destroy({
                success: function() {
                    console.log('deletePreregistration done')
                    res.success({success: true});
                },
                error: function(error) {
                    console.log('deletePreregistration error', error)
                    res.error(error);
                }
            });
        },
        error: function(error) {
            console.log('getUserObjectById error', error)
            res.error(error);
        }
    });
});
// END PRE-REGISTRATION FUNCTIONS



// ##########################################################
// ##########################################################
// HELPERS
// ##########################################################
// ##########################################################

function getUserObjectById(id) {
    var classObject = Parse.Object.extend("User");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getUserObjectByUsername(username) {
    var classObject = Parse.Object.extend("User");
    var query = new Parse.Query(classObject);
    query.equalTo("username", username);
    return query;
}

function getUsersByBranchAndStatus(branchPointer, status) {
    var classObject = Parse.Object.extend("User");
    var query = new Parse.Query(classObject);
    query.equalTo("branchPointer", branchPointer);
    query.equalTo("status", status);
    return query;
}

function getBranchById(id) {
    var classObject = Parse.Object.extend("Branch");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getCustomerServices() {
    var classObject = Parse.Object.extend("CustomerService");
    var query = new Parse.Query(classObject);
    query.descending("createdAt");
    return query;
}

function getCustomerServiceById(id) {
    var classObject = Parse.Object.extend("CustomerService");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getInquireById(id) {
    var classObject = Parse.Object.extend("Inquire");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getInquireByUserPointer(userPointer) {
    var classObject = Parse.Object.extend("Inquire");
    var query = new Parse.Query(classObject);
    query.equalTo("userPointer", userPointer);
    return query;
}

function getClientByName(name) {
    var classObject = Parse.Object.extend("Client");
    var query = new Parse.Query(classObject);
    query.matches("name", name, "i");
    return query;
}

function getReservationByBranchPointer(branchPointer, status) {
    var classObject = Parse.Object.extend("Reservation");
    var query = new Parse.Query(classObject);
    query.equalTo("branchPointer", branchPointer);

    if (status)
        query.equalTo("status", status);

    query.include("userPointer");
    return query;
}

function getReservationNotDone(branchPointer) {
    var classObject = Parse.Object.extend("Reservation");
    var query = new Parse.Query(classObject);
    query.equalTo("branchPointer", branchPointer);
    query.notEqualTo("status", "DONE");
    query.include("userPointer");
    return query;
}

function getReservationById(id) {
    var classObject = Parse.Object.extend("Reservation");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getChannelById(id) {
    var classObject = Parse.Object.extend("Channel");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getPostById(id) {
    var classObject = Parse.Object.extend("Post");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}

function getPlanById(id) {
    var classObject = Parse.Object.extend("Plan");
    var query = new Parse.Query(classObject);
    query.equalTo("objectId", id);
    return query;
}