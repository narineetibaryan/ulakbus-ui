/*! ulakbus-ui  2015-08-26 */
"use strict";var app=angular.module("ulakbus",["ui.bootstrap","angular-loading-bar","ngRoute","ngSanitize","ngCookies","general","formService","ulakbus.dashboard","ulakbus.auth","ulakbus.staff","ulakbus.student","schemaForm","gettext","templates-prod"]).constant("RESTURL",function(){return{url:"http://"+window.location.hostname+":9001/"}}()).constant("USER_ROLES",{all:"*",admin:"admin",student:"student",staff:"staff",dean:"dean"}).constant("AUTH_EVENTS",{loginSuccess:"auth-login-success",loginFailed:"auth-login-failed",logoutSuccess:"auth-logout-success",sessionTimeout:"auth-session-timeout",notAuthenticated:"auth-not-authenticated",notAuthorized:"auth-not-authorized"}).directive("activeLink",["$location",function($location){return{restrict:"A",link:function($scope,$element,$attrs){var clazz=$attrs.activeLink,path=$location.path();path=path,$scope.location=$location,$scope.$watch("location.path()",function(newPath){path===newPath?$element.addClass(clazz):$element.removeClass(clazz)})}}}]).directive("logout",function($http,$location){return{link:function($scope,$element,$rootScope){$element.on("click",function(){$http.post("http://"+window.location.hostname+":9001/logout",{}).then(function(){$rootScope.loggedInUser=!1,console.log($rootScope.loggedInUser),$location.path("/login"),$scope.$apply()})})}}});app.config(["$routeProvider",function($routeProvider){$routeProvider.when("/login",{templateUrl:"components/auth/login.html",controller:"LoginCtrl"}).when("/dashboard",{templateUrl:"components/dashboard/dashboard.html",controller:"DashCtrl"}).when("/student/add",{templateUrl:"components/student/student_add_template.html",controller:"StudentAddEditCtrl"}).when("/student/edit/:id",{templateUrl:"components/student/student_add_template.html",controller:"StudentAddEditCtrl"}).when("/students",{templateUrl:"components/student/student_list_template.html",controller:"StudentListCtrl"}).when("/student/:id",{templateUrl:"components/student/student_list_template.html",controller:"StudentShowCtrl"}).when("/staff/add",{templateUrl:"components/staff/templates/add.html",controller:"StaffAddEditCtrl"}).when("/staff/edit/:id",{templateUrl:"components/staff/templates/edit.html",controller:"StaffAddEditCtrl"}).when("/staffs",{templateUrl:"components/staff/templates/list.html",controller:"StaffListCtrl"}).when("/staff/:id",{templateUrl:"components/staff/templates/show.html",controller:"StaffShowCtrl"}).otherwise({redirectTo:"/dashboard"})}]).run(function($rootScope,$location,$cookies){$rootScope.loggedInUser?$rootScope.loggedInUser:!1,$rootScope.$on("$routeChangeStart",function(event,next,current){null==$rootScope.loggedInUser&&("login/login.html"===next.templateUrl||$location.path("/login"))})}).config(["$httpProvider",function($httpProvider){$httpProvider.defaults.withCredentials=!0}]).run(function(gettextCatalog){gettextCatalog.setCurrentLanguage("tr"),gettextCatalog.debug=!0});var form_generator=angular.module("formService",["general","ui.bootstrap"]);form_generator.factory("Generator",function($http,$q,$log,$modal,$timeout,RESTURL,FormDiff){var generator={};return generator.makeUrl=function(url){return RESTURL.url+url},generator.generate=function(scope,forms){for(var key in forms)scope[key]=forms[key];return scope.initialModel=angular.copy(scope.model),scope.form.push({type:"submit",title:"Save"}),scope.listnodeform={},(scope.listnode&&scope.listnodes[0]||scope.nodes&&scope.nodes[0])&&angular.forEach(scope.form,function(key,val){"object"==typeof key&&"fieldset"==key.type&&(key.type="template",key.templateUrl="shared/templates/fieldset.html",scope.listnodes.indexOf(key.title)>=0&&(scope.listnodeform[key.title]={},scope.listnodeform[key.title].schema={title:angular.copy(key.title),type:"object",properties:{},required:[]},angular.forEach(scope.schema.properties,function(k,v){angular.forEach(key.items,function(item){item.key==v&&(scope.listnodeform[key.title].schema.properties[v]=angular.copy(k))})}),key.setType="ListNode",scope.listnodeform[key.title].form=[angular.copy(key)],scope.listnodeform[key.title].model={},key.type="list",delete key.templateUrl,delete key.items))}),scope.isCollapsed=!0,scope.object_id=scope.form_params.object_id,scope.openmodal=function(listnode,nodeID){var modalInstance=$modal.open({animation:!1,templateUrl:"shared/templates/listnodeModalContent.html",controller:"ListNodeModalCtrl",size:"lg",resolve:{items:function(){return nodeID&&(scope.listnodeform[listnode].model=1),scope.listnodeform[listnode]}}});modalInstance.result.then(function(childmodel,key){angular.forEach(childmodel,function(v,k){scope.model[k]?scope.model[k][v.idx]=v:(scope.model[k]={},scope.model[k][v.idx]=v),scope.$broadcast("schemaFormRedraw")})})},generator.group(scope)},generator.group=function(formObject){return formObject},generator.get_form=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return generator.generate(scope,res.data.forms)})},generator.get_list=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return res})},generator.get_single_item=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return res})},generator.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},generator.asyncValidators={emailNotValid:function(value){var deferred=$q.defer();return $timeout(function(){generator.isValidEmail(value)?deferred.resolve():deferred.reject()},500),deferred.promise}},generator.submit=function($scope){if($scope.object_id)var get_diff=FormDiff.get_diff($scope.model,$scope.initialModel),data={object_id:$scope.object_id,form:get_diff,cmd:"do"};else data={form:$scope.model,cmd:"do"};return $http.post(generator.makeUrl($scope.url),data)},generator}),form_generator.controller("ListNodeModalCtrl",function($scope,$modalInstance,items){for(var key in items)$scope[key]=items[key];$scope.onSubmit=function(form){$modalInstance.close($scope.model,$scope.form.title)},$scope.cancel=function(){$modalInstance.dismiss("cancel")}});var general=angular.module("general",[]);general.factory("FormDiff",function(){var formDiff={};return formDiff.get_diff=function(obj1,obj2){var result={};for(key in obj1)obj2[key]!=obj1[key]&&(result[key]=obj1[key]),"array"==typeof obj2[key]&&"array"==typeof obj1[key]&&(result[key]=arguments.callee(obj1[key],obj2[key])),"object"==typeof obj2[key]&&"object"==typeof obj1[key]&&(result[key]=arguments.callee(obj1[key],obj2[key]));return result},formDiff}),app.config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push(function($q,$rootScope,$location){return{request:function(config){return"POST"==config.method&&(config.headers["Content-Type"]="text/plain"),config},response:function(response){return response.data.is_login===!0&&($rootScope.loggedInUser=response.data.is_login,$location.replace(),"/login"===$location.path()&&$location.path("/dashboard")),response.data.screen&&$location.path(response.data.screen),response},responseError:function(rejection){return 400===rejection.status&&$location.reload(),401===rejection.status&&("/login"===$location.path()?console.log("show errors on login form"):$location.path("/login")),$q.reject(rejection)}}})}]),$(function(){$("#side-menu").metisMenu()}),$(function(){$(window).bind("load resize",function(){topOffset=50,width=this.window.innerWidth>0?this.window.innerWidth:this.screen.width,width<768?($("div.navbar-collapse").addClass("collapse"),topOffset=100):$("div.navbar-collapse").removeClass("collapse"),height=(this.window.innerHeight>0?this.window.innerHeight:this.screen.height)-1,height-=topOffset,height<1&&(height=1),height>topOffset&&$("#page-wrapper").css("min-height",height+"px")});var url=window.location,element=$("ul.nav a").filter(function(){return this.href==url||0==url.href.indexOf(this.href)}).addClass("active").parent().parent().addClass("in").parent();element.is("li")&&element.addClass("active")}),app.directive("headerNotification",function(){return{templateUrl:"shared/templates/directives/header-notification.html",restrict:"E",replace:!0}}),app.directive("sidebar",["$location",function(){return{templateUrl:"shared/templates/directives/sidebar.html",restrict:"E",replace:!0,scope:{},controller:function($scope){$scope.selectedMenu="dashboard",$scope.collapseVar=0,$scope.multiCollapseVar=0,$scope.check=function(x){x==$scope.collapseVar?$scope.collapseVar=0:$scope.collapseVar=x},$scope.multiCheck=function(y){y==$scope.multiCollapseVar?$scope.multiCollapseVar=0:$scope.multiCollapseVar=y}}}}]),app.directive("stats",function(){return{templateUrl:"shared/templates/directives/stats.html",restrict:"E",replace:!0,scope:{model:"=",comments:"@",number:"@",name:"@",colour:"@",details:"@",type:"@","goto":"@"}}}),app.directive("notifications",function(){return{templateUrl:"shared/templates/directives/notifications.html",restrict:"E",replace:!0}}),app.directive("sidebarSearch",function(){return{templateUrl:"shared/templates/directives/sidebar-search.html",restrict:"E",replace:!0,scope:{},controller:function($scope){$scope.selectedMenu="home"}}}),app.directive("timeline",function(){return{templateUrl:"shared/templates/directives/timeline.html",restrict:"E",replace:!0}}),app.directive("chat",function(){return{templateUrl:"shared/templates/directives/chat.html",restrict:"E",replace:!0}});var auth=angular.module("ulakbus.auth",["ngRoute","schemaForm","ngCookies","general"]);auth.controller("LoginCtrl",function($scope,$q,$timeout,$routeParams,Generator,LoginService){$scope.url="simple_login",$scope.form_params={},$scope.form_params.clear_wf=1,Generator.get_form($scope).then(function(data){$scope.form=["*",{key:"password",type:"password"},{type:"submit",title:"Save"}]}),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid?LoginService.login($scope.url,$scope.model).error(function(data){$scope.message=data.title}):console.log("not valid")}}),auth.factory("LoginService",function($http,$rootScope,$location,$log,$cookies,$window,Session,RESTURL){var loginService={};return loginService.login=function(url,credentials){return credentials={login_crd:credentials,cmd:"do"},$http.post(RESTURL.url+url,credentials).success(function(data,status,headers,config){$rootScope.loggedInUser=!0}).error(function(data,status,headers,config){return data})},loginService.logout=function(){console.log("logout"),$http.post(RESTURL.url+"logout",{}).then(function(){$rootScope.loggedInUser=!1,$location.path("/login")}),console.log("loggedout")},loginService.isAuthenticated=function(){return!!Session.userId},loginService.isAuthorized=function(authorizedRoles){return angular.isArray(authorizedRoles)||(authorizedRoles=[authorizedRoles]),loginService.isAuthenticated()&&-1!==loginService.indexOf(Session.userRole)},loginService.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},loginService}),auth.service("Session",function(){this.create=function(sessionId,userId,userRole){this.id=sessionId,this.userId=userId,this.userRole=userRole},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null}}),angular.module("ulakbus.dashboard",["ngRoute"]).controller("DashCtrl",function($scope){$scope.testData="<h1>This is main Dashboard</h1>"});var staff=angular.module("ulakbus.staff",["ngRoute","schemaForm","formService","ui.bootstrap"]);staff.controller("StaffAddEditCtrl",function($scope,$rootScope,$location,$http,$log,$modal,Generator,$routeParams){$scope.url="personel_duzenle_basitlestirilmis",$scope.form_params={},$routeParams.id?($scope.form_params.object_id=$routeParams.id,$scope.form_params.cmd="edit_object"):$scope.form_params.cmd="add_object",$scope.form_params.clear_wf=1,Generator.get_form($scope),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid&&Generator.submit($scope).success(function(data){$location.path("/staffs")}).error(function(data){$scope.message=data.title})}}),staff.controller("StaffListCtrl",function($scope,$rootScope,Generator){$scope.url="personel_duzenle_basitlestirilmis",$scope.form_params={clear_wf:1},Generator.get_list($scope).then(function(res){var data=res.data.employees;for(var item in data)delete data[item].data.deleted,delete data[item].data.timestamp;$scope.staffs=data})}),staff.controller("StaffShowCtrl",function($scope,$rootScope,Generator,$routeParams){$scope.url="personel_duzenle_basitlestirilmis",$scope.form_params={object_id:$routeParams.id,clear_wf:1},Generator.get_single_item($scope).then(function(res){$scope.staff=res.data.employees[0].data})});var student=angular.module("ulakbus.student",["ngRoute","schemaForm","formService","general"]);student.controller("StudentAddEditCtrl",function($scope,$http,$log,Generator,$routeParams){Generator.get_form("add_student",$routeParams).then(function(d){$scope.schema=d.schema,$scope.form=d.form,$scope.model=d.model?d.model:{},$scope.initialModel=angular.copy(d.model),$scope.form[0].$asyncValidators=Generator.asyncValidators,$scope.form.push({type:"submit",title:"Save"})}),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid&&Generator.submit("add_staff",$scope)}}),student.controller("StudentListCtrl",function($scope,$http){$http.get("http://127.0.0.1:3000/api/list_student").then(function(res){$scope.students=res.data})});var staff=angular.module("ulakbus.types",["ngRoute","schemaForm","formService"]);staff.controller("TypeCtrl",function($scope,$http,$log,Generator,$routeParams){Generator.get_form("input_types",$routeParams).then(function(d){$scope.congressFilter="Choice",$scope.schema=d.schema,$scope.form=d.form,$scope.model={},$scope.form[0].$asyncValidators=Generator.asyncValidators,$scope.form.push({type:"submit",title:"Save"})}),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid&&$log.info($scope)}}),auth.factory("LoginService",function($http,$rootScope,$location,$log,$cookies,$window,Session,RESTURL){var loginService={};return loginService.login=function(url,credentials){return credentials={login_crd:credentials,cmd:"do"},$http.post(RESTURL.url+url,credentials).success(function(data,status,headers,config){$rootScope.loggedInUser=!0}).error(function(data,status,headers,config){return data})},loginService.logout=function(){console.log("logout"),$http.post(RESTURL.url+"logout",{}).then(function(){$rootScope.loggedInUser=!1,$location.path("/login")}),console.log("loggedout")},loginService.isAuthenticated=function(){return!!Session.userId},loginService.isAuthorized=function(authorizedRoles){return angular.isArray(authorizedRoles)||(authorizedRoles=[authorizedRoles]),loginService.isAuthenticated()&&-1!==loginService.indexOf(Session.userRole)},loginService.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},loginService}),auth.service("Session",function(){this.create=function(sessionId,userId,userRole){this.id=sessionId,this.userId=userId,this.userRole=userRole},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null}});