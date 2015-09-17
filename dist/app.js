/*! ulakbus-ui  2015-09-18 */
"use strict";var app=angular.module("ulakbus",["ui.bootstrap","angular-loading-bar","ngRoute","ngSanitize","ngCookies","general","formService","ulakbus.dashboard","ulakbus.auth","ulakbus.crud","schemaForm","gettext","templates-prod"]).constant("RESTURL",function(){var backendurl="http://api.ulakbus.net";if(document.cookie.indexOf("backendurl")>-1){var cookiearray=document.cookie.split(";");angular.forEach(cookiearray,function(item){item.indexOf("backendurl")&&(backendurl=item.split("=")[1])})}if(location.href.indexOf("backendurl")>-1){var urlfromqstr=location.href.split("?")[1].split("=")[1];backendurl=decodeURIComponent(urlfromqstr.replace(/\+/g," ")),document.cookie="backendurl="+backendurl}return{url:backendurl}}()).constant("USER_ROLES",{all:"*",admin:"admin",student:"student",staff:"staff",dean:"dean"}).constant("AUTH_EVENTS",{loginSuccess:"auth-login-success",loginFailed:"auth-login-failed",logoutSuccess:"auth-logout-success",sessionTimeout:"auth-session-timeout",notAuthenticated:"auth-not-authenticated",notAuthorized:"auth-not-authorized"});app.config(["$routeProvider",function($routeProvider){$routeProvider.when("/login",{templateUrl:"components/auth/login.html",controller:"LoginCtrl"}).when("/dashboard",{templateUrl:"components/dashboard/dashboard.html",controller:"DashCtrl"}).when("/:model/add",{templateUrl:"components/crud/templates/add.html",controller:"CRUDAddEditCtrl"}).when("/:model/edit/:id",{templateUrl:"components/crud/templates/add.html",controller:"CRUDAddEditCtrl"}).when("/:model",{templateUrl:"components/crud/templates/list.html",controller:"CRUDListCtrl"}).when("/:model/:id",{templateUrl:"components/crud/templates/show.html",controller:"CRUDShowCtrl"}).when("/staff/add",{templateUrl:"components/staff/templates/add.html",controller:"StaffAddEditCtrl"}).when("/staff/edit/:id",{templateUrl:"components/staff/templates/edit.html",controller:"StaffAddEditCtrl"}).when("/staffs",{templateUrl:"components/staff/templates/list.html",controller:"StaffListCtrl"}).when("/staff/:id",{templateUrl:"components/staff/templates/show.html",controller:"StaffShowCtrl"}).otherwise({redirectTo:"/dashboard"})}]).run(function($rootScope,$location,$cookies){$rootScope.loggedInUser?$rootScope.loggedInUser:!1,$rootScope.$on("$routeChangeStart",function(event,next,current){})}).config(["$httpProvider",function($httpProvider){$httpProvider.defaults.withCredentials=!0}]).run(function(gettextCatalog){gettextCatalog.setCurrentLanguage("tr"),gettextCatalog.debug=!0}),app.config(["$httpProvider",function($httpProvider){$httpProvider.interceptors.push(function($q,$rootScope,$location){return{request:function(config){return"POST"==config.method&&(config.headers["Content-Type"]="text/plain"),config},response:function(response){return response.data.is_login===!0&&($rootScope.loggedInUser=response.data.is_login,"/login"===$location.path()&&$location.path("/dashboard")),response.data.client_cmd&&console.log(response.data.client_cmd),response},responseError:function(rejection){return 400===rejection.status&&$location.reload(),401===rejection.status&&($rootScope.loggedInUser=!1,"/login"===$location.path()?console.log("show errors on login form"):$location.path("/login")),403===rejection.status&&1==rejection.data.is_login&&"/login"===$location.path()&&$location.path("/dashboard"),$q.reject(rejection)}}})}]);var general=angular.module("general",[]);general.factory("FormDiff",function(){var formDiff={};return formDiff.get_diff=function(obj1,obj2){var result={};for(key in obj1)obj2[key]!=obj1[key]&&(result[key]=obj1[key]),"array"==typeof obj2[key]&&"array"==typeof obj1[key]&&(result[key]=arguments.callee(obj1[key],obj2[key])),"object"==typeof obj2[key]&&"object"==typeof obj1[key]&&(result[key]=arguments.callee(obj1[key],obj2[key]));return result},formDiff});var form_generator=angular.module("formService",["general"]);form_generator.factory("Generator",function($http,$q,$log,$location,$modal,$timeout,RESTURL,FormDiff){var generator={};return generator.makeUrl=function(url){return RESTURL.url+url},generator.generate=function(scope,data){return data.forms?(angular.forEach(data.forms,function(value,key){scope[key]=data.forms[key]}),scope.token=data.token,scope.initialModel=angular.copy(scope.model),generator.prepareFormItems(scope),scope.object_id=scope.form_params.object_id,generator.group(scope)):scope},generator.group=function(formObject){return formObject},generator.prepareFormItems=function(scope){return angular.forEach(scope.schema.properties,function(k,v){if("date"==k.type&&(k.type="string",scope.model[v]=generator.dateformatter(scope.model[v]),scope.$watch($("#"+v),function(){$timeout(function(){jQuery("#"+v).datepicker({dateFormat:"dd.mm.yy",onSelect:function(date){scope.model[v]=date}})})})),"int"==k.type&&(k.type="number"),"model"==k.type){var formitem=scope.form[scope.form.indexOf(v)],modelscope={url:scope.url,form_params:{model:k.title}};formitem={type:"template",templateUrl:"shared/templates/foreignKey.html",title:k.title,titleMap:generator.get_list(modelscope).then(function(res){formitem.titleMap=[],angular.forEach(res.data.objects,function(item){formitem.titleMap.push({value:item.key,name:item.data.name?item.data.name:item.data.username})})}),onChange:function(modelValue,form){scope.model[v]=modelValue}},scope.form[scope.form.indexOf(v)]=formitem}("ListNode"==k.type||"Node"==k.type)&&(scope[k.type]=scope[k.type]?scope[k.type]:{},scope[k.type][k.title]={title:k.title,form:[],schema:{properties:{},required:[],title:k.title,type:"object",formType:k.type},url:scope.url},scope[k.type][k.title].model=null!=scope.model[v]?scope.model[v]:{},angular.forEach(k.schema,function(item){scope[k.type][k.title].schema.properties[item.name]=item,1==item.required&&"idx"!=item.name&&scope[k.type][k.title].schema.required.push(item.name),"idx"==item.name?scope[k.type][k.title].form.push({type:"string",key:item.name,htmlClass:"hidden"}):scope[k.type][k.title].form.push(item.name)}),scope[k.type][k.title].lengthModels=scope.model[k.title]?1:0)}),scope},generator.dateformatter=function(formObject){var ndate=new Date(formObject);if("Invalid Date"==ndate)return"";var newdatearray=[ndate.getDate(),ndate.getMonth(),ndate.getFullYear()];return newdatearray.join(".")},generator.get_form=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return generator.generate(scope,res.data)})},generator.get_list=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return res})},generator.get_single_item=function(scope){return $http.post(generator.makeUrl(scope.url),scope.form_params).then(function(res){return res})},generator.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},generator.asyncValidators={emailNotValid:function(value){var deferred=$q.defer();return $timeout(function(){generator.isValidEmail(value)?deferred.resolve():deferred.reject()},500),deferred.promise}},generator.submit=function($scope){var data={form:$scope.model,cmd:$scope.form_params.cmd,subcmd:"do_list",model:$scope.form_params.model,token:$scope.token};$scope.object_id&&(data.object_id=$scope.object_id),$http.post(generator.makeUrl($scope.url),data).success().then(function(res){res.data.client_cmd&&(console.log("record fin"),$location.path($scope.form_params.model))})},generator}),form_generator.controller("ModalCtrl",function($scope,$modalInstance,Generator,$route,items){angular.forEach(items,function(value,key){$scope[key]=items[key]}),console.log(items),Generator.prepareFormItems($scope),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),console.log(form.$valid),$modalInstance.close($scope)},$scope.cancel=function(){$modalInstance.dismiss("cancel")}}),form_generator.directive("modalForNodes",function($modal){return{link:function(scope,element,attributes){element.on("click",function(){var modalInstance=$modal.open({animation:!1,templateUrl:"shared/templates/listnodeModalContent.html",controller:"ModalCtrl",size:"lg",resolve:{items:function(){var attribs=attributes.modalForNodes.split(","),node=angular.copy(scope.$parent.$parent[attribs[1]][attribs[0]]);return node}}});modalInstance.result.then(function(childmodel,key){"Node"==childmodel.schema.formType&&(scope.$parent.model[childmodel.schema.title]=childmodel.model),"ListNode"==childmodel.schema.formType&&(null==scope.$parent.model[childmodel.schema.title]&&(scope.$parent.model[childmodel.schema.title]=[]),scope.$parent.model[childmodel.schema.title].push(childmodel.model)),childmodel.lengthModels+=1})})}}}),form_generator.directive("addModalForLinkedModel",function($modal,Generator){return{link:function(scope,element){element.on("click",function(){var modalInstance=$modal.open({animation:!1,templateUrl:"shared/templates/linkedModelModalContent.html",controller:"ModalCtrl",size:"lg",resolve:{items:function(){return Generator.get_form({url:"crud",form_params:{model:scope.form.title,cmd:"add"}})}}});modalInstance.result.then(function(childmodel,key){Generator.submit(scope)})})}}}),form_generator.directive("editModalForLinkedModel",function($modal,Generator){return{link:function(scope,element){element.on("click",function(){var modalInstance=$modal.open({animation:!1,templateUrl:"shared/templates/linkedModelModalContent.html",controller:"ModalCtrl",size:"lg",resolve:{items:function(){return Generator.get_form({url:"crud",form_params:{model:scope.form.title,cmd:"add"}})}}});modalInstance.result.then(function(childmodel,key){Generator.submit(scope)})})}}}),$(function(){$("#side-menu").metisMenu()}),$(function(){$(window).bind("load resize",function(){topOffset=50,width=this.window.innerWidth>0?this.window.innerWidth:this.screen.width,width<768?($("div.navbar-collapse").addClass("collapse"),topOffset=100):$("div.navbar-collapse").removeClass("collapse"),height=(this.window.innerHeight>0?this.window.innerHeight:this.screen.height)-1,height-=topOffset,height<1&&(height=1),height>topOffset&&$("#page-wrapper").css("min-height",height+"px")});var url=window.location,element=$("ul.nav a").filter(function(){return this.href==url||0==url.href.indexOf(this.href)}).addClass("active").parent().parent().addClass("in").parent();element.is("li")&&element.addClass("active")}),app.directive("logout",function($http,$location,RESTURL){return{link:function($scope,$element,$rootScope){$element.on("click",function(){$http.post(RESTURL.url+"logout",{}).then(function(){$rootScope.loggedInUser=!1,console.log($rootScope.loggedInUser),$location.path("/login"),$scope.$apply()})})}}}),app.directive("headerNotification",function(){return{templateUrl:"shared/templates/directives/header-notification.html",restrict:"E",replace:!0}}),app.directive("headerSubMenu",function(){return{templateUrl:"shared/templates/directives/header-sub-menu.html",restrict:"E",controller:"CRUDAddEditCtrl",replace:!0,link:function($scope){$scope.triggerSubmit=function(){angular.element($("#submitbutton")).triggerHandler("click"),angular.element($("#submitbutton")).triggerHandler("click")}}}}),app.directive("headerBreadcrumb",function($location){return{templateUrl:"shared/templates/directives/header-breadcrumb.html",restrict:"E",replace:!0,link:function($scope){$scope.$watch("$routeUpdate",function(){$scope.links=$location.path().split("/")})}}}),app.directive("sidebar",["$location",function(){return{templateUrl:"shared/templates/directives/sidebar.html",restrict:"E",replace:!0,scope:{},controller:function($scope,$http,RESTURL){$http.post(RESTURL.url+"crud/").success(function(data){$scope.menuItems=data.models}),$scope.selectedMenu="dashboard",$scope.collapseVar=0,$scope.multiCollapseVar=0,$scope.check=function(x){x==$scope.collapseVar?$scope.collapseVar=0:$scope.collapseVar=x},$scope.multiCheck=function(y){y==$scope.multiCollapseVar?$scope.multiCollapseVar=0:$scope.multiCollapseVar=y}}}}]),app.directive("stats",function(){return{templateUrl:"shared/templates/directives/stats.html",restrict:"E",replace:!0,scope:{model:"=",comments:"@",number:"@",name:"@",colour:"@",details:"@",type:"@","goto":"@"}}}),app.directive("notifications",function(){return{templateUrl:"shared/templates/directives/notifications.html",restrict:"E",replace:!0}}),app.directive("sidebarSearch",function(){return{templateUrl:"shared/templates/directives/sidebar-search.html",restrict:"E",replace:!0,scope:{},controller:function($scope){$scope.selectedMenu="home"}}}),app.directive("timeline",function(){return{templateUrl:"shared/templates/directives/timeline.html",restrict:"E",replace:!0}}),app.directive("chat",function(){return{templateUrl:"shared/templates/directives/chat.html",restrict:"E",replace:!0}});var auth=angular.module("ulakbus.auth",["ngRoute","schemaForm","ngCookies","general"]);auth.controller("LoginCtrl",function($scope,$q,$timeout,$routeParams,Generator,LoginService){$scope.url="login",$scope.form_params={},$scope.form_params.clear_wf=1,Generator.get_form($scope).then(function(data){$scope.form=["*",{key:"password",type:"password"},{type:"submit",title:"Save"}]}),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid?LoginService.login($scope.url,$scope.model).error(function(data){$scope.message=data.title}):console.log("not valid")}}),auth.factory("LoginService",function($http,$rootScope,$location,$log,$cookies,$window,Session,RESTURL){var loginService={};return loginService.login=function(url,credentials){return credentials={login_crd:credentials,cmd:"do"},$http.post(RESTURL.url+url,credentials).success(function(data,status,headers,config){$rootScope.loggedInUser=!0}).error(function(data,status,headers,config){return data})},loginService.logout=function(){console.log("logout"),$http.post(RESTURL.url+"logout",{}).then(function(){$rootScope.loggedInUser=!1,$location.path("/login")}),console.log("loggedout")},loginService.isAuthenticated=function(){return!!Session.userId},loginService.isAuthorized=function(authorizedRoles){return angular.isArray(authorizedRoles)||(authorizedRoles=[authorizedRoles]),loginService.isAuthenticated()&&-1!==loginService.indexOf(Session.userRole)},loginService.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},loginService}),auth.service("Session",function(){this.create=function(sessionId,userId,userRole){this.id=sessionId,this.userId=userId,this.userRole=userRole},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null}}),auth.factory("LoginService",function($http,$rootScope,$location,$log,$cookies,$window,Session,RESTURL){var loginService={};return loginService.login=function(url,credentials){return credentials.cmd="do",$http.post(RESTURL.url+url,credentials).success(function(data,status,headers,config){$rootScope.loggedInUser=!0}).error(function(data,status,headers,config){return data})},loginService.logout=function(){console.log("logout"),$http.post(RESTURL.url+"logout",{}).then(function(){$rootScope.loggedInUser=!1,$location.path("/login")}),console.log("loggedout")},loginService.isAuthenticated=function(){return!!Session.userId},loginService.isAuthorized=function(authorizedRoles){return angular.isArray(authorizedRoles)||(authorizedRoles=[authorizedRoles]),loginService.isAuthenticated()&&-1!==loginService.indexOf(Session.userRole)},loginService.isValidEmail=function(email){var re=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return re.test(email)},loginService}),auth.service("Session",function(){this.create=function(sessionId,userId,userRole){this.id=sessionId,this.userId=userId,this.userRole=userRole},this.destroy=function(){this.id=null,this.userId=null,this.userRole=null}}),angular.module("ulakbus.dashboard",["ngRoute"]).controller("DashCtrl",function($scope,$rootScope,$location){$rootScope.loggedInUser||$location.path("/login"),$scope.testData="<h1>This is main Dashboard</h1>"});var crud=angular.module("ulakbus.crud",["ngRoute","schemaForm","formService","ui.bootstrap"]);crud.controller("CRUDAddEditCtrl",function($scope,$rootScope,$location,$http,$log,$modal,$timeout,Generator,$routeParams){$scope.url="crud",$scope.form_params={model:$routeParams.model},$routeParams.id?($scope.form_params.object_id=$routeParams.id,$scope.form_params.cmd="edit"):$scope.form_params.cmd="add",$routeParams.model&&Generator.get_form($scope),$scope.onSubmit=function(form){$scope.$broadcast("schemaFormValidate"),form.$valid&&Generator.submit($scope).success(function(data){$location.path("/crud")}).error(function(data){$scope.message=data.title})}}),crud.controller("CRUDListCtrl",function($scope,$rootScope,Generator,$routeParams){$scope.url="crud",$scope.form_params={model:$routeParams.model},Generator.get_list($scope).then(function(res){var data=res.data.objects;for(var item in data)delete data[item].data.deleted,delete data[item].data.timestamp;$scope.objects=data,$scope.model=$routeParams.model})}),crud.controller("CRUDShowCtrl",function($scope,$rootScope,Generator,$routeParams){$scope.url="crud",$scope.form_params={object_id:$routeParams.id,cmd:"show",model:$routeParams.model},Generator.get_single_item($scope).then(function(res){$scope.object=res.data.object,$scope.model=$routeParams.model})});