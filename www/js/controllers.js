angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout, authService, localStorageService, $location, $ionicHistory, $rootScope, notification, $ionicSideMenuDelegate, $window,$cordovaGeolocation, weatherService) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    $scope.$on('$ionicView.enter', function (e) {
       
    });

    CallEveryTime();
    
    $scope.showEmp = true;
    $scope.authentication = {};
    $scope.authentication = localStorageService.get('LoggedUser');
    try {
        if ($scope.authentication.isAuth) {
            $scope.welcome = $scope.authentication.userName.substring(0, $scope.authentication.userName.indexOf("@webfortis.com"));
            if ($scope.authentication.isCustomer) {
                $window.location.href = ('#/app/home');
            }
            else if (!$scope.authentication.isCustomer) {
                $window.location.href = ('#/app/home');
            }
        }
        else {
            $window.location.href = ('#/app/signin');
        }

        $ionicHistory.nextViewOptions({
            disableBack: true
        });

    }
    catch (err) {
        $location.path('/app/signin');
    }
    
    // Form data for the login modal
    $scope.loginData = {
        LoginType: "Employee"
    };
    $scope.checked = '';
    $scope.devList = [
   { text: "Customer", value: "Customer" },
   { text: "Employee", value: "Employee" }

    ];

    $scope.diffrentiateEmpCust=function(data)
    {
        if (data === "Employee") { $scope.showEmp = true; }
        else if (data === "Customer") { $scope.showEmp = false; }
    }
    $scope.callassesmentmodal = function () {
        window.open('http://www.webfortis.com/maturity-model', '_system', 'location=yes'); return false;
    }

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        //var empemail = $scope.loginData.empusername;

        //var password = $scope.loginData.password;
        //if (!email || !password) {
        //    $rootScope.notify("Please enter valid credentials");
        //    return false;
        //}
       
       
        $rootScope.show('Please wait.. Authenticating');
        if ($scope.loginData.LoginType == "Employee")
        {
            var a = $scope.loginData.empusername.substring(0, $scope.loginData.empusername.indexOf("@webfortis.com"));
            if (a) {
                $scope.loginData.empusername = a;
            }
            $scope.PostData = {
                ServerAddress: "crm.dynamics.com",
                Username: $scope.loginData.empusername + '@webfortis.com',
                Password: $scope.loginData.password,
                ssl: true,
                o365: true,
                loginType: $scope.loginData.LoginType,
                useRefreshTokens: true,
                rememberme: $scope.loginData.rememberme
            };
        } else
        {
            $scope.PostData = {
                ServerAddress: "crm.dynamics.com",
                Username: $scope.loginData.custusername,
                Password: $scope.loginData.password,
                ssl: true,
                o365: true,
                loginType: $scope.loginData.LoginType,
                useRefreshTokens: true,
                rememberme: $scope.loginData.rememberme
            };
        }
        
        console.log($scope.PostData);
        authService.login($scope.PostData).then(function (result) {
            authService.gettoken().then(function (tokenresponse) {
                $scope.authentication = localStorageService.get('LoggedUser');
                $scope.welcome = $scope.authentication.userName;
                $rootScope.hide();
                $window.location.href = ('#/app/home');
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $window.location.reload();
                
            })
        }, function (errr) {
            try {
                $rootScope.hide();
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
           
        })
       
    };

    //call after Successfully Login
    function CallEveryTime() {
        //Show time

        $scope.showtime = function () {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            var s = today.getSeconds();
            m = checkTime(m);
            s = checkTime(s);
            $scope.time = h + ":" + m;
            var t = setTimeout(function () { $scope.showtime() }, 500);
            function checkTime(i) {
                if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
                return i;
            }
        }
        $scope.showtime();


        //GEo location
        var posOptions = { timeout: 10000, enableHighAccuracy: false };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
              var lat = position.coords.latitude
              var long = position.coords.longitude
              console.log(lat + ':' + long);
              //weather controller
              $scope.weather = weatherService.getWeather(lat, long);
          }, function (err) {
              $rootScope.notify(err.message);
              console.log(err.message);
          });


        var watchOptions = {
            frequency: 1000,
            timeout: 3000,
            enableHighAccuracy: false // may cause errors if true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        console.log(watch);
        watch.then(
          null,
          function (err) {
              $rootScope.notify(err.message);
              console.log(err.message);
          },
          function (position) {
              var lat = position.coords.latitude
              var long = position.coords.longitude
              //weather controller
              $scope.weather = weatherService.getWeather(lat, long);
          });


        //watch.clearWatch();
        //// OR
        //$cordovaGeolocation.clearWatch(watch)
        //  .then(function (result) {
        //      // success
        //  }, function (error) {
        //      // error
        //  });
    }

    $scope.logout = function () {
        authService.logOut();
        $scope.welcome = "";
        $window.location.href =('#/app/signin');
        $scope.authentication = localStorageService.get('LoggedUser');
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
    }

    $scope.$ionicSideMenuDelegate = $ionicSideMenuDelegate;
})

.controller('timeCntrl', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicHistory, TimesheetService,notification, $location, $timeout, getsetService, authService, localStorageService) {
    $scope.authentication = localStorageService.get('LoggedUser');
        $scope.toggleGroup = function (group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function (group) {
            return $scope.shownGroup === group;
        };
        $scope.myActiveSlide = 1;
        $scope.timesheetload = false;
        $scope.slidedisable = false;
        $scope.totalhours = '';
        $scope.SpecificDataforThisdate = [];
        var date = new Date();
        date.setDate(date.getDate());
        $scope.date = notification.convertDate(date);
       
        getdata($scope.date);

        $scope.slidePrevious = function () {
            date.setDate(date.getDate() - 1);
            $scope.date = notification.convertDate(date);
             getdata($scope.date);
           
        }
        $scope.slideNext = function () {
            date.setDate(date.getDate() + 1);
            $scope.date = notification.convertDate(date);
            getdata($scope.date);
        }

    
        //$scope.$on('$ionicView.enter', function () {
        //    if (!$scope.authentication.isAuth) {
        //        $location.path('/app/signin');
        //        $ionicHistory.nextViewOptions({
        //            disableBack: true
        //        });
        //    }
        //    getdata($scope.date);
        //})

        //Go to next page
        $scope.Goto = function () {
            $location.path('/app/timesheetforspecificdate');
            getsetService.Setdate($scope.date);
        }

    //  day bottom total
    function d1Total() {
       
        var total = 0;
        angular.forEach($scope.SpecificDataforThisdate, function (row, index) {
            total += parseInt(row.hours);
        });
        return total;
    }
    //function for Get task data for specfic date
    function getdata(date) {
        var datatopost = { userid: localStorageService.get('LoggedUser').userId, date: date };
        $scope.timesheetload = true;
        $scope.slidedisable = true;
        TimesheetService.GettaskforSpecificDatemesheet(datatopost).then(function (out) {
            $scope.SpecificDataforThisdate = out;
           
            $scope.totalhours = d1Total();
            
            $scope.timesheetload = false;
            $scope.slidedisable = false;
        },function (errr) {
            try {
                $scope.timesheetload = false;
                $scope.slidedisable = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }
})

.controller('timeforspecificCntrl', function ($scope, $stateParams, TimesheetService, $location, $timeout, getsetService,recentitem, localStorageService, getsetServiceForExpense, $rootScope, notification, getsetServiceForTravel) {
    $scope.task = {};
    $scope.Projects = {};
    $scope.TaskType = {};
    $scope.recentproject = {};
    $scope.recenttab = true;
    $scope.projectload = false;
    $scope.tasktypeload = false;
    $scope.$on('$ionicView.enter', function () {
        
        var Choosedate = getsetService.Getdata();
        
        $scope.task.date = Choosedate.startdate;
        $scope.task.empguid = localStorageService.get('LoggedUser').userId;
        if (Choosedate.project) {
            $scope.task.projectname = Choosedate.project.ProjectName;
            $scope.task.projectguid = Choosedate.project.Id;
        }
        if (Choosedate.tasktype) {
            $scope.task.tasktype = Choosedate.tasktype.Name;
            $scope.task.tasktypeid = Choosedate.tasktype.Id;
        }

    })


    //auto text area
    $scope.autoExpand = function (e) {
        var element = typeof e === 'object' ? e.target : document.getElementById(e);
        var scrollHeight = element.scrollHeight - 60; // replace 60 by the sum of padding-top and padding-bottom
        element.style.height = scrollHeight + "px";
    };

    $scope.type = $stateParams.type;
    

    $scope.recentinitproject = function () {
        $scope.recentinitproject = recentitem.recentproject();
        if ($scope.recentinitproject == null) {
            $scope.recenttab = false;
            $scope.initproject();
        }
    }
    $scope.initproject = function () {
        //console.log("call");
        //Get all Project
        $scope.recenttab = false;
        $scope.projectload = true;
        var type = 'active';
        TimesheetService.GetProject(type).then(function (success) {
            $scope.projectload = false;
            $scope.Projects = success;
        }, function (errr) {
            try {
                $scope.tasktypeload = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }
    $scope.recentinittasktype = function () {
        $scope.recentinittasktype = recentitem.recenttasktype();
        if ($scope.recentinittasktype ==null) {
            $scope.recenttab = false;
            $scope.inittasktype();
        }
    }
    $scope.inittasktype = function () {
        //console.log("call");
        //Get all task type
        $scope.recenttab = false;
        $scope.tasktypeload = true;
        TimesheetService.GetTaskType().then(function (success) {
            $scope.tasktypeload = false;
            //console.log(success);
            $scope.TaskType = success;
        }, function (errr) {
            try {
                $scope.tasktypeload = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }


    $scope.setproject = function (input) {
        //console.log(input);
        if ($scope.type == "timesheet") {
            getsetService.Setproject(input);
            $location.path('/app/timesheetforspecificdate');
        }
        if ($scope.type == "expense") {
            getsetServiceForExpense.SetExpenseproject(input);
            $location.path('/app/expenseform');
        }
        if($scope.type=="travel")
        {
            getsetServiceForTravel.Setproject(input);
            $location.path('/app/travelrequestform');
        } 
    }

    $scope.settasktype = function (input) {
        //console.log(input);
        getsetService.SetTasktype(input);
        $location.path('/app/timesheetforspecificdate');
    }


    $scope.save = function () {
        $rootScope.show('saving..');
        $scope.task.hours = $scope.task.hours + "." + $scope.task.minutes;
        console.log($scope.task);
        TimesheetService.Savetimesheet($scope.task).then(function (out) {
            $rootScope.hide();
            $location.path('/app/timesheet');
            getsetService.reset();
        }, function (errr) {
            try {
               
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })

    }

})

.controller('expensesCntrl', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicHistory,$rootScope,notification,recentitem, CategoryService, $location, $timeout,notification, getsetServiceForExpense, authService,localStorageService) {
   

        $scope.expense = {};
        $scope.allExpense = {};
        $scope.Categories = {};
        $scope.recenttab = true;
        $scope.expenseload = false;
        $scope.categoryload = false;
        $scope.totalamount = '';
        $scope.slidedisable = false;
        var date = new Date();
        date.setDate(date.getDate());
        $scope.date = notification.convertDate(date);
        getdata($scope.date);

        $scope.slidePrevious = function () {
           date.setDate(date.getDate() - 1);
            $scope.date = notification.convertDate(date);
            getdata($scope.date);
        }
        $scope.slideNext = function () {
            date.setDate(date.getDate() + 1);
            $scope.date = notification.convertDate(date);
            getdata($scope.date);
        }

        //Go to next page
        $scope.Goto = function () {
            getsetServiceForExpense.SetExpensedate($scope.date);
            $location.path('/app/expenseform');
        }
        //Acoordian Function
        $scope.toggleGroup = function (group) {
            if ($scope.isGroupShown(group)) {
                $scope.shownGroup = null;
            } else {
                $scope.shownGroup = group;
            }
        };
        $scope.isGroupShown = function (group) {
            return $scope.shownGroup === group;
        };
        $scope.$on('$ionicView.enter', function () {
            //getdata($scope.date);
            var expensedata = getsetServiceForExpense.GetExpensedata();
            $scope.expense.date = expensedata.Date;
            $scope.expense.empguid = localStorageService.get('LoggedUser').userId;
            if (expensedata.ProjectName) {
                $scope.expense.projectname = expensedata.ProjectName.ProjectName;
                $scope.expense.projectguid = expensedata.ProjectName.Id;
            }
            if (expensedata.CategoryName) {
                $scope.expense.expensetype = expensedata.CategoryName.Name;
                $scope.expense.expensetypeid = expensedata.CategoryName.Id;
            }

        })
     $scope.initrecentCategory = function () {
         $scope.recentinitcategory = recentitem.recentexpense();
         if ($scope.recentinitcategory == null) {
             $scope.recenttab = false;
             $scope.initCategory();
         }
        }
     $scope.initCategory = function () {
         $scope.recenttab = false;
            $scope.categoryload = true;
            CategoryService.Getcategory().then(function (out) {
                $scope.Categories = out;
                $scope.categoryload = false;
                //console.log(out);
            });
        }

        $scope.setcategory = function (input) {
           
            getsetServiceForExpense.SetExpenseCategory(input);
            $location.path('/app/expenseform');
        }

        //save expense data 
        $scope.save = function (input) {
            $rootScope.show('saving..');
            CategoryService.ExpensePost($scope.expense).then(function (out) {
                $rootScope.hide();
                getsetServiceForExpense.reset();
                $location.path('/app/expenses');
            }, function (errr) {
                try {
                    $rootScope.notify(errr.Message);
                } catch (e) {
                    $rootScope.hide();
                }
            })
        }


    

    //function for Get Expense data for specfic date
        function getdata(date1) {
            var datatopost = { userid: localStorageService.get('LoggedUser').userId, date: date1 };
            $scope.slidedisable = true;
        $scope.expenseload = true;
        CategoryService.GetExpense(datatopost).then(function (out) {
            $scope.expenseload = false;
            $scope.slidedisable = false;
            $scope.allExpense = out;
            $scope.totalamount = AmountTotal();
        }, function (errr) {
            try {
                $scope.expenseload = false;
                $scope.slidedisable = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }
    // Amount total
    function AmountTotal() {
        //console.log("total day col");
        var total = 0;
        angular.forEach($scope.allExpense, function (row, index) {
            total += parseInt(row.amount);
        });
        return total;
    }
  
})

.controller('requestCntrl', function ($scope, $ionicModal, TravelrequestService, $location, $timeout, authService, localStorageService, $rootScope, notification, getsetServiceForTravel) {
    $scope.alltraveldata = {};
    $scope.travel = {};
    $scope.travelshow = false;
    $scope.$on('$ionicView.enter', function () {
        getdata();
        var Choosedate = getsetServiceForTravel.Getdata();
        if (Choosedate.project) {
            $scope.travel.projectname = Choosedate.project.ProjectName;
            $scope.travel.projectguid = Choosedate.project.Id;
        }
    })
    $scope.changekey = function (data) {
        TravelrequestService.getcities().then(function (out) {
            $scope.cities = out;
        })
    }


    $scope.Goto = function () {
        $location.path('/app/travelrequestform');
    }
    $scope.save = function () {
        $rootScope.show('saving..');
        
        $scope.travel.systemuserid = localStorageService.get('LoggedUser').userId;
        $scope.travel.departdate = notification.convertDate($scope.travel.departdate);
        $scope.travel.returndate = notification.convertDate($scope.travel.returndate);

       
        TravelrequestService.Posttravelrequest($scope.travel).then(function (out) {
            $location.path('/app/travelrequest');
            $rootScope.hide();
        }, function (errr) {
            try {
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }
    //Acoordian Function
    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };

    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    function getdata() {
        $scope.travelshow = true;
        var datatopost = { userid: localStorageService.get('LoggedUser').userId };
        TravelrequestService.AlltravelRequest(datatopost).then(function (out) {
            $scope.alltraveldata = out;
            //console.log($scope.alltraveldata);
            $scope.travelshow = false;
        }, function (errr) {
            try {
                $scope.travelshow = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
           
        })
    }
})

.controller('leaveCntrl', function ($scope, $location, LeaveService, localStorageService, $rootScope, notification) {
    $scope.leaveshow = false;
    $scope.allleavedata = {};
    $scope.leave = {};
    $scope.$on('$ionicView.enter', function () {
        getdata();
    })
    $scope.Goto = function () {
        $location.path('/app/leavepage');
    }
    //Acoordian Function
    $scope.toggleGroup = function (group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };

    $scope.isGroupShown = function (group) {
        return $scope.shownGroup === group;
    };

    $scope.save = function () {
        $rootScope.show('saving..');
        $scope.leave.fromdate = notification.convertDate($scope.leave.fromdate);
        $scope.leave.enddate = notification.convertDate($scope.leave.enddate);
        //console.log($scope.leave);
        $scope.leave.systemuserid = localStorageService.get('LoggedUser').userId;
        LeaveService.Postleave($scope.leave).then(function (out) {
            //console.log('successfully posted!!');
            //console.log(out);
            $rootScope.hide();
            $location.path('/app/leave');
        }, function (errr) {
            try {
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }

    function getdata() {
        $scope.leaveshow = true;
        var datatopost = { userid: localStorageService.get('LoggedUser').userId };
        LeaveService.Allleaverequest(datatopost).then(function (out) {
            console.log(out);
            $scope.allleavedata = out;
            $scope.leaveshow = false;
        }, function (errr) {
            try {
                $scope.leaveshow = false;
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }

})



.controller('FindanEmployee', function ($scope, $ionicSlideBoxDelegate, $ionicModal, $ionicHistory, FindanEmployeeService, $location, $timeout, getsetService, authService, $rootScope, notification,localStorageService) {
    $scope.Employee = {};
    //$scope.$on('$ionicView.enter', function () {
    //    getdata();
    //})
    //get all user
    getdata();
    $scope.singleuser = FindanEmployeeService.getsingleuser();
    function getdata() {
        $ionicHistory.clearHistory();
        $scope.employeeload = true;
        FindanEmployeeService.Allemployee().then(function (success) {
            $scope.employeeload = false;
            $scope.Employee = success;
        }, function (errr) {
            try {
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }
        
    //get single user
    $scope.setEmployee=function(systemuserid)
    {
        $scope.GetUserInfo = _.filter($scope.Employee, function (obj) {
            return obj.SystemUserId == systemuserid;
        })
        FindanEmployeeService.setsingleuser($scope.GetUserInfo);
        $location.path('/app/employeedetailinfo');
    }
    
})

.controller('UserProfile', function ($scope, FindanEmployeeService, $location,$ionicHistory, $timeout,ngAuthSettings, getsetService, authService, $rootScope, notification, localStorageService, $cordovaCamera, $cordovaFile, $cordovaFileTransfer, $cordovaActionSheet) {
    $scope.user = {};
    getdata();
    function getdata() {
        $rootScope.show("wait..");
        $ionicHistory.clearHistory();
        FindanEmployeeService.GetUserFromServer(localStorageService.get('LoggedUser').userId).then(function (success) {
            $rootScope.hide();
            console.log(success);
            $scope.user = success;
            $scope.user.Name = $scope.user.FirstName + " " + $scope.user.LastName;
        }, function (errr) {
            try {
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }

    $scope.save = function () {
        $rootScope.show('saving..');
        $scope.user.SystemUserId = localStorageService.get('LoggedUser').userId;
        FindanEmployeeService.PostUser($scope.user).then(function (out) {
            //console.log('successfully posted!!');
            //console.log(out);
            $rootScope.hide();
            $location.path('/app/home');
        }, function (errr) {
            try {
                $rootScope.notify(errr.Message);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }

    $scope.images = [];
    $scope.picData = "";
    //Post Image Function
    $scope.addImage = function (index) {
        // 2
        //var options = {
        //    quality: 50,
        //    destinationType: Camera.DestinationType.FILE_URI,
        //    sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        //    encodingType: 0     // 0=JPG 1=PNG
        //}
        if (index == 1) {
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                quality: 50
            };

        }
        if (index == 2) {
            var options = {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType:  Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                popoverOptions: CameraPopoverOptions,
                quality:50
            };

        }
        $rootScope.show("uploading...");
        $cordovaCamera.getPicture(options).then(function (imageData) {
            var serviceBase = ngAuthSettings.apiServiceBaseUri;
            var server = serviceBase + "api/upload?userid=" + localStorageService.get('LoggedUser').userId;
            $scope.picData = imageData;
            var myImg = $scope.picData;
            var options = new FileUploadOptions();
            options.fileName =localStorageService.get('LoggedUser').userId+".jpg",
            options.fileKey = "post";
            options.chunkedMode = false;
            options.headers = { 'Authorization': "Bearer " + localStorageService.get('Token').access_token };
            var ft = new FileTransfer();
            ft.upload(myImg, encodeURI(server),onUploadSuccess, onUploadFail, options);
        }, function (err) {
            $rootScope.notify(JSON.stringify(err));
        });

        function onUploadSuccess(data) {
            $rootScope.hide();
            var image = document.getElementById('profilepic');
            image.src = $scope.picData;
            $rootScope.notify("uploaded successfully");
        }
        function onUploadFail(data) {
            $rootScope.notify("uploaded failed");
        }
        //// 3
        //$cordovaCamera.getPicture(options).then(function (imageData) {
        //    //console.log(imageData);
        //    //console.log(options);   
        //    var image = document.getElementById('profilepic');
        //    image.src = imageData;  
        //    var serviceBase = ngAuthSettings.apiServiceBaseUri;
        //    var server = serviceBase + "api/upload?userid=" + localStorageService.get('LoggedUser').userId,
        //        filePath = imageData;
        //        var date = new Date();
        //        var header = { 'Authorization': "Bearer " + localStorageService.get('Token').access_token };
        //        var options = {
        //            fileKey: "file",
        //            // fileName: localStorageService.get('LoggedUser').userId,
        //            fileName: imageData.substr(imageUriToUpload.lastIndexOf('/')+1),
        //            chunkedMode: false,
        //            mimeType: "image/jpg",
        //            headers: header,
        //            chunkedMode: true
        //        };
        //        document.addEventListener('deviceready', function () {
        //            $cordovaFileTransfer.upload(server, filePath, options).then(function (result) {
        //                console.log("SUCCESS: " + JSON.stringify(result.response));
        //                console.log('Result_' + result.response[0] + '_ending');
        //                alert("success");
        //                alert(JSON.stringify(result.response));

        //            }, function (err) {
        //                console.log("ERROR: " + JSON.stringify(err));
        //                alert(JSON.stringify(err));
        //            }, function (progress) {
        //                // constant progress updates
        //            });
        //        })
        //}, function(err) {
        //    // error
        //    console.log(err);
        //});
     
    }

    //open actionsheet
    // Triggered on a button click, or some other target
    $scope.show = function () {
        console.log('call');
        // Show the action sheet
        var options = {
            title: 'Upload Your Image',
            buttonLabels: ['From Camera', 'From File Manager'],
            addCancelButtonWithLabel: 'Cancel',
            androidEnableCancelButton: true,
            winphoneEnableCancelButton: true,
            //addDestructiveButtonWithLabel: 'Delete it'
        };
        document.addEventListener("deviceready", function () {
            $cordovaActionSheet.show(options)
              .then(function (btnIndex) {
                  var index = btnIndex;
                      $scope.addImage(index);
              });
        }, false);
       
    };
})
//for upload image
.controller('PictureCtrl', function ($scope, $cordovaCamera) {

    document.addEventListener("deviceready", function () {

        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            var image = document.getElementById('myImage');
            image.src = "data:image/jpeg;base64," + imageData;
        }, function (err) {
            // error
        });

    }, false);

    document.addEventListener("deviceready", function () {
        var options = {
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
        };

        $cordovaCamera.getPicture(options).then(function (imageURI) {
            var image = document.getElementById('myImage');
            image.src = imageURI;
        }, function (err) {
            // error
        });


        // $cordovaCamera.cleanup().then(...); // only for FILE_URI

    }, false);

})

.controller('CustomerProjectCtrl', function ($scope, CustomerService, localStorageService) {
    $scope.projects;
    $scope.projectload = true;
    var getProjects = CustomerService.CustomerProjects(localStorageService.get('LoggedUser').userId).then(function (result) {
        $scope.projectload = false;
        $scope.projects = result;
    })
})

.controller('profileController', function ($scope, CustomerService, $ionicPopup, $window, localStorageService, $rootScope, notification, $location) {

    $scope.Profile = {};

    //This method is used for initilization the customer profile data
    $scope.initilizationProfile = function () {
        $rootScope.show("wait..");
        var getProfileData = CustomerService.CustomerProfile(localStorageService.get('LoggedUser').userId).then(function (result) {
            console.log(result);
            $rootScope.hide();
            $scope.Profile.Email = result.EmailAddress1;
            $scope.Profile.HomeCellNo = result.HomeContactNo;
            $scope.Profile.OrignalEmailAddress = result.EmailAddress1;
        }, function (errr) {
            try {
                $rootScope.notify(errr);
            } catch (e) {
                $rootScope.hide();
            }
        })
    }

    //this method is used for update the customer profile data

    $scope.updateProfile = function (Profile) {
        console.log("Update Profile Method is calling");
        console.log(Profile);
        $rootScope.show("updating..");
        var getUpdateRespond = CustomerService.updateProfile(Profile, localStorageService.get('LoggedUser').userId).then(function (result) {
            $rootScope.hide();
            console.log("Successfully Updated in controller");
            console.log(result);
            if (result == "Successfully") {
                //var alertPopup = $ionicPopup.alert({
                //    title: 'Message',
                //    template: 'Updated Successfully'
                //});
                //alertPopup.then(function (res) {
                //    $window.location.href = ('#/app/home');
                //    $window.location.reload();
                //});
               
                $rootScope.notify("Updated Successfully");
                $location.path('/app/home');
            }
            if (errr == "AlreadyExist") {
                //var alertPopup = $ionicPopup.alert({
                //    title: 'Sorry',
                //    template: 'EMail Id already Exist'
                //});
                //alertPopup.then(function (res) {

                //});
                $rootScope.notify("EMail Id already Exist");
            }

           

        }, function (errr) {
            try {
                $rootScope.hide();
                $rootScope.notify("EMail Id already Exist. Not Updated!!");
            } catch (e) {
                $rootScope.hide();
            }
        })
    }



    $scope.updateProfile1 = function () {
        var alertPopup = $ionicPopup.alert({
            title: 'Message',
            template: 'Updated Successfully'
        });
        alertPopup.then(function (res) {
            $window.location.href = ('#/app/home');
            $window.location.reload();
        });
    };

})