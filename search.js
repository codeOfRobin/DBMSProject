var app = angular.module('myApp', []);

app.controller('autoCompleteController', ['$scope', function($scope){
	$scope.locationURL = "http://gd.geobytes.com/AutoCompleteCity?callback=JSON_CALLBACK";
}])

var states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii',
  'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

app.directive('autoCompleteDirective',function(){
	return{
		restrict : 'A',
		scope : {
			// url : '@'
			ngModel : '='
		},
		require : 'ngModel',
		link: function(scope, elm, attrs, ngModel){
			elm.autocomplete({
				// source : function(request, response){
				// 	$http({method:'jsonp', url: scope.url, params:{q:request.term}}).success(function(data){
				// 		response(data);
				// 	})
				// },
				source : states,
				minlength : 3,
				select : function(event, ui){
					ngModel.$setViewValue(ui.item.value);
					// scope.$apply(function(){
					// 	scope.ngModel = ui.item.value;						
					// });
				}
			})
		}
	}
})