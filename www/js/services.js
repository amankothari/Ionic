'use strict';
angular.module('starter.services', [])

.factory('authService', ['$http', '$q', 'localStorageService', 'ngAuthSettings', '$window', function ($http, $q, localStorageService, ngAuthSettings, $window) {

        var serviceBase = ngAuthSettings.apiServiceBaseUri;
        var authServiceFactory = {};

        var _authentication = {
            isAuth: false,
            userName: "",
            userId: "",
            useRefreshTokens: false,
            isCustomer: false,
        };

        var _login = function (loginData) {
            console.log(loginData);
            _logOut();
            var deferred = $q.defer();
            $http.post(serviceBase + 'api/audience', loginData).success(function (response) {
                //console.log(response);
                if (loginData.useRefreshTokens) {
                    localStorageService.set('AudienceData', { ClientId: response.ClientId, userName: loginData.Username, password: loginData.Password, refreshToken: response.refresh_token, useRefreshTokens: true });
                }
                else {
                    localStorageService.set('AudienceData', { ClientId: response.ClientId, userName: loginData.Username, password: loginData.Password, useRefreshTokens: false });
                }
                if (loginData.loginType == "Customer") {
                    _authentication.isCustomer = true;
                }
                _authentication.isAuth = true;
                _authentication.userName = loginData.Username;
                _authentication.useRefreshTokens = false;
                _authentication.userId = response.Userid;
                localStorageService.set('LoggedUser', _authentication);
                deferred.resolve(response);

            }).error(function (err, status) {
                _logOut();
                deferred.reject(err);
            });

            return deferred.promise;

        };
        var _gettoken = function () {
            var authData = localStorageService.get('AudienceData');
            var admin = { userName: "akothari@webfortis.com", password: "wfp@ssw0rd" };
            //var admin = { userName: "akothari@crmlrn1.onmicrosoft.com", password: "am@n4192" };
            if (authData) {
                if (authData.ClientId) {
                    var deferred = $q.defer();
                    var data = "grant_type=password&username=" + admin.userName + "&password=" + admin.password + "&client_id=" + authData.ClientId;
                    localStorageService.remove('Token');
                    $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {
                        localStorageService.set('Token', { access_token: response.access_token, username: response.username, useRefreshTokens: true });
                        deferred.resolve(response);

                    }).error(function (err, status) {
                        _logOut();
                        $window.location.reload();
                        deferred.reject(err);

                    });
                }
            }
            return deferred.promise;

        }
        var _logOut = function () {
            localStorageService.remove('AudienceData', 'LoggedUser', 'Token');
            _authentication.isAuth = false;
            _authentication.isCustomer = false;
            _authentication.userName = "";
            _authentication.useRefreshTokens = false;
            localStorageService.set('LoggedUser', _authentication);
        };

        var _fillAuthData = function () {

            var authData = localStorageService.get('AudienceData');
            if (authData) {
                _authentication.isAuth = true;
                _authentication.userName = authData.userName;
                _authentication.useRefreshTokens = authData.useRefreshTokens;
            }

        };

        var _refreshToken = function () {
            var deferred = $q.defer();

            var authData = localStorageService.get('AudienceData');
            console.log('AudienceData');
            console.log(authData);
            if (authData) {

                if (authData.useRefreshTokens) {

                    var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + authData.ClientId;

                    localStorageService.remove('AudienceData');

                    $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

                        localStorageService.set('AudienceData', { token: response.access_token, userName: response.userName, refreshToken: response.refresh_token, useRefreshTokens: true });

                        deferred.resolve(response);

                    }).error(function (err, status) {
                        _logOut();
                        deferred.reject(err);
                    });
                }
            }

            return deferred.promise;
        };



        authServiceFactory.login = _login;
        authServiceFactory.logOut = _logOut;
        authServiceFactory.fillAuthData = _fillAuthData;
        authServiceFactory.authentication = _authentication;
        authServiceFactory.refreshToken = _refreshToken;
        authServiceFactory.gettoken = _gettoken;
        return authServiceFactory;
}])

.factory('authInterceptorService', ['$q', '$injector', '$location', 'localStorageService', '$window', '$rootScope', function ($q, $injector, $location, localStorageService, $window, $rootScope) {

        var authInterceptorServiceFactory = {};

        var _request = function (config) {

            config.headers = config.headers || {};

            var authData = localStorageService.get('Token');
            if (authData) {
                config.headers.Authorization = 'Bearer ' + authData.access_token;
            }

            return config;
        }

        var _responseError = function (rejection) {
            if (rejection.status === 401) {
                var authService = $injector.get('authService');
                var authData = localStorageService.get('AudienceData');
                if (authData) {
                    if (authData.useRefreshTokens) {
                        authService.gettoken().then(function (tokenresponse) {
                            $window.location.href = ('#/app/home');
                        })

                        return $q.reject(rejection);
                    }
                }
                else {
                    authService.logOut();
                    $location.path('#/app/signin');
                }

            }
            if (rejection.status === 0) {
                $rootScope.notify("Please check your Internet connection.");
            }
            return $q.reject(rejection);
        }

        authInterceptorServiceFactory.request = _request;
        authInterceptorServiceFactory.responseError = _responseError;

        return authInterceptorServiceFactory;
    }])

.factory('TimesheetService', function ($q, $http, ngAuthSettings) {
    var TimesheetServiceFactory = {};
    var url = ngAuthSettings.apiServiceBaseUri;
    var _GetProject = function (type) {
        //console.log('Service calling');
        var deferred = $q.defer();
        $http.get(url + 'api/project').success(function (results) {
            //console.log('Successfully Get Timesheet Project Data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _GetTaskType = function () {
        //console.log('Service calling');
        var deferred = $q.defer();
        $http.get(url + 'api/tasktype').success(function (results) {
            //console.log('Successfully Get Timesheet TaskType Data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }


    var _Savetimesheet = function (input) {

        //console.log('Service calling');
        var deferred = $q.defer();
        $http.post(url + 'api/timesheet', input).success(function (results) {
            //console.log('Successfully save data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _GettaskforSpecificDate = function (input) {
        //console.log('Service calling');
        var deferred = $q.defer();
        $http.get(url + 'api/timesheet?systemuserid=' + input.userid + '&date=' + input.date).success(function (results) {
            //console.log('Successfully Get task for Specific Date');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    TimesheetServiceFactory.GetProject = _GetProject;
    TimesheetServiceFactory.GetTaskType = _GetTaskType;
    TimesheetServiceFactory.Savetimesheet = _Savetimesheet;
    TimesheetServiceFactory.GettaskforSpecificDatemesheet = _GettaskforSpecificDate;
    return TimesheetServiceFactory;
})

.factory('getsetService', function ($injector) {
    var tempdata = {};
    var data = {};
    var recentitem = $injector.get('recentitem');
    return data = {
        Getdata: function () {
            return tempdata;
        },
        Setdate: function (input) {
            tempdata.startdate = input;
        },
        Setproject: function (input) {
            tempdata.project = input;
            recentitem.setrecentproject(input);
        },
        SetTasktype: function (input) {
            tempdata.tasktype = input;
            recentitem.setrecenttasktype(input);
        },
        reset: function () {
            tempdata = {};
        }
    };
})

.factory('recentitem', function ($injector, localStorageService) {
    var tempdata = {};
    var data = [];
    var datafortasktype = [];
    var dataforexpense = [];
    var _setrecentproject = function (input) {
        var nameofcookie= 'p_'+ localStorageService.get('LoggedUser').userId;
        if (localStorageService.get(nameofcookie)){
            data = [];
            data = localStorageService.get(nameofcookie);
            var status=_.filter(data,function(o){
                return o.Id == input.Id;
            })
            console.log(status);
            if (status.length==0) {
                data.push(input);
            }
        } else {
            data.push(input)
        }
        localStorageService.set(nameofcookie, data);
      
        console.log(localStorageService.get(nameofcookie));
        };
    var _recentproject = function () {

        var nameofcookie = 'p_' + localStorageService.get('LoggedUser').userId;
        var data = localStorageService.get(nameofcookie);
        return data ;
    };
    var _setrecenttasktype = function (input) {
        var nameofcookie = 't_' + localStorageService.get('LoggedUser').userId;
        if (localStorageService.get(nameofcookie)) {
            datafortasktype = [];
            datafortasktype = localStorageService.get(nameofcookie);
            var status = _.filter(datafortasktype, function (o) {
                return o.Id == input.Id;
            })
            console.log(status);
            if (status.length == 0) {
                datafortasktype.push(input);
            }
        } else {
            datafortasktype.push(input)
        }
        localStorageService.set(nameofcookie, datafortasktype);
        console.log(localStorageService.get(nameofcookie));
    };
    var _recenttasktype = function () {
        var nameofcookie = 't_' + localStorageService.get('LoggedUser').userId;
        var data = localStorageService.get(nameofcookie, datafortasktype);
        return data;
    };
    var _setrecentexpense = function (input) {
        var nameofcookie = 'e_' + localStorageService.get('LoggedUser').userId;
        if (localStorageService.get(nameofcookie)) {
            dataforexpense = [];
            dataforexpense = localStorageService.get(nameofcookie);
            var status = _.filter(dataforexpense, function (o) {
                return o.Id == input.Id;
            })
            console.log(status);
            if (status.length == 0) {
                dataforexpense.push(input);
            }
        } else {
            dataforexpense.push(input)
        }
        localStorageService.set(nameofcookie,dataforexpense);
        console.log(localStorageService.get(nameofcookie));
    };
    var _recentexpense = function () {
        var nameofcookie = 'e_' + localStorageService.get('LoggedUser').userId;
        var data = localStorageService.get(nameofcookie);
        return data;
    };
        tempdata.setrecentproject = _setrecentproject;
        tempdata.recentproject = _recentproject;
        tempdata.setrecenttasktype = _setrecenttasktype;
        tempdata.recenttasktype = _recenttasktype;
        tempdata.setrecentexpense = _setrecentexpense;
        tempdata.recentexpense = _recentexpense;
        return tempdata;
})

.factory('getsetServiceForTravel', function ($injector) {
    var tempdata = {};
    var data = {};
    var recentitem = $injector.get('recentitem');
    return data = {
        Getdata: function () {
            return tempdata;
        },
        Setproject: function (input) {
            tempdata.project = input;
            recentitem.setrecentproject(input);
        },
        reset: function () {
            tempdata = {};
        }
    };
})

.factory('notification', function ($rootScope, $ionicLoading, $window, $cordovaToast) {
   // template: text ? '<p class="item-icon-left">' + text + '<ion-spinner icon="android"></ion-spinner></p>' : '<p class="item-icon-left">Loading..<ion-spinner icon="android"></ion-spinner></p>',
    $rootScope.show = function (text) {
        $rootScope.loading = $ionicLoading.show({
            template: text ? text : "Loading..",
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
    };
    $rootScope.hide = function () {
        $ionicLoading.hide();
    };
    $rootScope.notify = function (text) {
        $cordovaToast.showLongBottom(text).then(function (success) {
            console.log(text);
            // success
        }, function (error) {
            // error
        });

        //$rootScope.show(text);
        //$window.setTimeout(function () {
        //    $rootScope.hide();
        //}, 1999);
    };

    return {
        convertDate: function (inputFormat) {
            function pad(s) { return (s < 10) ? '0' + s : s; }
            var d = new Date(inputFormat);
            return [pad(d.getMonth() + 1), pad(d.getDate()), d.getFullYear()].join('-');
        }
    }

})

.factory('TravelrequestService', function ($q, $http, ngAuthSettings) {
    var TravelrequestServiceFactory = {};
    var url = ngAuthSettings.apiServiceBaseUri;
    //get cities using adgeo free service
    var _getcities = function (change) {
        var deferred = $q.defer();
        var url = 'http://gd.geobytes.com/AutoCompleteCity?callback&q=';
        $http.get(url + change).success(function (result) {
            //console.log('get cities');
            deferred.resolve(result);
        }).error(function (data, status, headers, config) {
            // this isn't happening:
            //console.log("saved comment", data);
            return data;
        });
        return deferred.promise;
    }


    var _Alltravelrequest = function (input) {
        var deferred = $q.defer();
        $http.get(url + 'api/travel?systemuserid=' + input.userid).success(function (out) {
            //console.log('call api/requestooo api');
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _Posttravelrequest = function (data) {
        var deferred = $q.defer();
        $http.post(url + 'api/travel', data).success(function (out) {
            //console.log('post travel request');
            //console.log(out);
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    TravelrequestServiceFactory.getcities = _getcities;
    TravelrequestServiceFactory.AlltravelRequest = _Alltravelrequest;
    TravelrequestServiceFactory.Posttravelrequest = _Posttravelrequest;
    return TravelrequestServiceFactory;
})

.factory('LeaveService', function ($q, $http, ngAuthSettings) {
    var LeaveServiceFactory = {};
    var url = ngAuthSettings.apiServiceBaseUri;

    var _Allleaverequest = function (input) {
        var deferred = $q.defer();
        $http.get(url + 'api/requestooo?systemuserid=' + input.userid).success(function (out) {
            //console.log('call api/travelrequest api');
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _Postleave = function (data) {
        var deffred = $q.defer();
        $http.post(url + 'api/requestooo', data).success(function (out) {
            //console.log('post travel request');
            //console.log(out);
            deffred.resolve(out);
        }).error(function (err, status) {
            deffred.reject(err);
        });
        return deffred.promise;
    }
    LeaveServiceFactory.Allleaverequest = _Allleaverequest;
    LeaveServiceFactory.Postleave = _Postleave;
    return LeaveServiceFactory;
})

.factory('getsetServiceForExpense', function ($rootScope, $injector) {
     var tempdata = {};
     var data = {};
     var recentitem = $injector.get('recentitem');
     return data = {
         GetExpensedata: function () {
             return tempdata;
         },
         SetExpensedate: function (input) {
             tempdata.Date = input;
         },
         SetExpenseproject: function (input) {
             tempdata.ProjectName = input;
             recentitem.setrecentproject(input);
         },
         SetExpenseCategory: function (input) {
             tempdata.CategoryName = input;
             recentitem.setrecentexpense(input);
         },
         reset: function () {
             tempdata = {};
         }
     };

 })

.factory('CategoryService', function ($q, $http, ngAuthSettings) {
    var CategoryServiceFactory = {};
    var url = ngAuthSettings.apiServiceBaseUri;
    var _Getcategory = function () {
        //console.log('Service calling');
        var deferred = $q.defer();
        $http.get(url + 'api/Category').success(function (results) {
            //console.log('Successfully Get Expense Categorys Data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _ExpensePost = function (input) {
        //console.log('_ExpensePost calling');
        var deferred = $q.defer();
        $http.post(url + 'api/Expenses', input).success(function (results) {
            //console.log('Successfully post Expense Data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _GetExpense = function (input) {
        //console.log('_ExpensePost calling');
        var deferred = $q.defer();
        $http.get(url + 'api/Expenses?systemuserid=' + input.userid + '&date=' + input.date).success(function (results) {
            //console.log('Successfully Get Expense Data');
            deferred.resolve(results);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    CategoryServiceFactory.Getcategory = _Getcategory;
    CategoryServiceFactory.ExpensePost = _ExpensePost;
    CategoryServiceFactory.GetExpense = _GetExpense;
    return CategoryServiceFactory;
})

.factory('FindanEmployeeService', function ($q, $http, ngAuthSettings) {
    var FindanEmployeeFactory = {};
    var url = ngAuthSettings.apiServiceBaseUri;

    var employee = {};

    var _Allemployee = function () {
        var deferred = $q.defer();
        $http.get(url + 'api/findemployee').success(function (out) {
            //console.log('call api/travelrequest api');
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }

    var _GetUserFromServer=function(userid)
    {
        var deferred = $q.defer();
        $http.get(url + 'api/findemployee?SystemUserid=' + userid).success(function (out) {
            //console.log('call api/travelrequest api');
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    var _PostUser = function (data) {
        var deferred = $q.defer();
        $http.post(url + 'api/findemployee',data).success(function (out) {
            //console.log('call api/travelrequest api');
            deferred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deferred.promise;
    }
    var _singleemployee = function (data) {
        var deffred = $q.defer();
        $http.get(url + 'api/findemployee?SystemUserid=' + data).success(function (out) {
            //console.log('post travel request');
            //console.log(out);
            deffred.resolve(out);
        }).error(function (err, status) {
            deferred.reject(err);
        });
        return deffred.promise;
    }

    var _setsingleuser=function(data)
    {
        employee = {};
        employee = data;
    }
    var _getsingleuser = function () {
        return employee;
    }
    FindanEmployeeFactory.Allemployee = _Allemployee;
    FindanEmployeeFactory.Singleemployee = _singleemployee;
    FindanEmployeeFactory.setsingleuser = _setsingleuser;
    FindanEmployeeFactory.getsingleuser = _getsingleuser;
    FindanEmployeeFactory.GetUserFromServer = _GetUserFromServer;
    FindanEmployeeFactory.PostUser = _PostUser;
    return FindanEmployeeFactory;
})

.factory('CustomerService', function ($q, $http, ngAuthSettings, localStorageService) {


    var CustomerData = {};
    var url = ngAuthSettings.apiServiceBaseUri;
    var _CustomerProjects = function (userid) {
        var deffred = $q.defer();
        $http.get(url + 'api/customer/get?CustomerId=' + userid).success(function (respond) {
            console.log("Customer Project Data is Success");
            console.log(respond);
            deffred.resolve(respond);

        }).error(function (err, status) {
            deffred.reject(err);
        });
        return deffred.promise;
    }



    var _CustomerProfile = function (userid) {
        var deffred = $q.defer();
        $http.get(url + 'api/CustomerProfile?ContactId=' + userid).success(function (respond) {
            console.log("Customer profile Data is Success");
            console.log(respond);
            deffred.resolve(respond);

        }).error(function (err, status) {
            deffred.reject(err);
        });
        return deffred.promise;

    }

    var _updateProfile = function (Profile, userid) {
        var deffred = $q.defer();
        var PostData = { Id: userid, EmailAddress1: Profile.Email, HomeContactNo: Profile.HomeCellNo, OrignalEmailAddress: Profile.OrignalEmailAddress };
        $http.post(url + 'api/CustomerProfile', PostData).success(function (respond) {
            console.log("Customer profile Updated Data is Success");
            console.log(respond);
            deffred.resolve(respond);

        }).error(function (err, status) {
            deffred.reject(err);
        });
        return deffred.promise;
    }

    CustomerData.CustomerProjects = _CustomerProjects;
    CustomerData.CustomerProfile = _CustomerProfile;
    CustomerData.updateProfile = _updateProfile;

    return CustomerData;

})

.factory('weatherService', function ($http) {
    return {
        getWeather: function (lat,lon) {
            var weather = { temp: {}, clouds: null };
            var url = 'http://api.openweathermap.org/data/2.5/weather?lat='+lat+'&lon='+lon+'&units=imperial&callback=JSON_CALLBACK';
            $http.jsonp(url).success(function (data) {
                if (data) {
                    if (data.main) {
                        weather.temp.current = data.main.temp;
                        weather.temp.min = data.main.temp_min;
                        weather.temp.max = data.main.temp_max;
                    }
                    weather.clouds = data.clouds ? data.clouds.all : undefined;
                }
            });

            return weather;
        }
    };
})

.factory('SendEmailService', function ($q, $http, ngAuthSettings) {
    var url = ngAuthSettings.apiServiceBaseUri;
    return {
        SendEmail: function (data) {
            console.log(data);
            var deffred = $q.defer();
            $http.get(url + 'api/SendEmail?MailTo='+data.email+'&Subject=Travel Request Form&body=test').success(function (respond) {
                console.log(respond);
                deffred.resolve(respond);
            }).error(function (err, status) {
                deffred.reject(err);
            });
            return deffred.promise;

            return weather;
        }
    };
});