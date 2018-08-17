angular.module("todos.controllers", ["todos.services"]).
    controller("LoginCtrl", ["$scope", "$http", "$location", function($scope, $http, $location) {

        $scope.login = function() {
            $http.post("/user/login", { Email: $scope.Email, Password: $scope.Password }).success(function () {
                $location.path('/lists');
            });
        };

    }]).
    controller("RegisterCtrl", ["$scope", "$http", "$location", function($scope, $http, $location) {

        $scope.register = function() {
            $http.post('/user/register', { Email: $scope.Email, Name: $scope.Name, Password: $scope.Password }).success(function() {
                $location.path('/lists');
            });
        };

    }]).
    controller("ListsCtrl", ["$scope", "TodoList", 'orderByFilter', function ($scope, TodoList, orderBy) {

        var self = this;

        $scope.$on('list:deleted', function() {
            self.setLists();
        });

        this.setLists = function() {
            TodoList.query(function (lists) {
                var items = [], buffer = [];
                lists.forEach(function(l, i) {
                    buffer.push(l);
                    if ((i + 1) % 2 == 0 && i != 0 || i == lists.length - 1) {
                        items.push({ row: buffer });
                        buffer = [];
                    }
                });

                $scope.lists = items;

                var rowIndex = 0, colIndex = 0;
                items.forEach(function (aRow) {
                    aRow.row.forEach(function (col) {
                        var key = rowIndex.toString() + colIndex.toString();
                        var reverse = window.localStorage.getItem(key) || 'false';
                        reverse = reverse == 'true' ? true : false;
                        $scope.lists[rowIndex].row[colIndex].Todos = orderBy($scope.lists[rowIndex].row[colIndex].Todos, 'Title', reverse);
                        colIndex++;
                    });
                    rowIndex++;
                    colIndex = 0;
                });
            });


        };

        this.setLists();

        $scope.addList = function() {
            var todo = new TodoList({ Name: $scope.Name });
            todo.$save(function () {
                $scope.$broadcast('list:added');
                self.setLists();
            });
        };

        $scope.sort = function (rowIndex, colIndex) {
            var key = rowIndex.toString() + colIndex.toString();
            var reverse = window.localStorage.getItem(key) || 'false';
            reverse = reverse == 'true' ? true: false;
            $scope.reverse = !reverse;
            window.localStorage.setItem(key, $scope.reverse);            

            $scope.lists[rowIndex].row[colIndex].Todos = orderBy($scope.lists[rowIndex].row[colIndex].Todos, 'Title', $scope.reverse);
        };

    }]).
    controller("ListCtrl", ["$scope", "ListTodo", "Todo", function ($scope, ListTodo, Todo) {

        $scope.$on('todo:deleted', function() {
            ListTodo.query({listId:$scope.list.Id}, function(todos) {
                $scope.list.Todos = todos;
            });
        });

        $scope.addTodo = function (title) {
            var todo = new ListTodo({ Title: title });
            todo.$save({ listId: $scope.list.Id }, function () {
                $scope.list.Todos.push(todo);
                $scope.showAddForm = 0;
                $scope.Title = "";
            });
        };

        $scope.completed = function () {
            var count = 0;
            angular.forEach($scope.list.Todos, function(todo) {
                count += todo.Completed ? 1 : 0;
            });
            return count;
        };
    }]).
    controller("TodoCtrl", ["$scope", "Todo", function ($scope, Todo) {

        $scope.deleteTodo = function (todo) {
            todo.deleting = true;
            Todo['delete']({ id: todo.Id }, {}, function () {
                $scope.$emit('todo:deleted');
            }, function() {
                todo.deleting = false;
            });
        };

        $scope.markDone = function (todo) {
            if (todo.deleting) return;
            todo.Completed = true;
            if (!todo.hasOwnProperty('$update'))
                todo = new Todo(todo);
            todo.$update();
        };

        $scope.markNotDone = function (todo) {
            if (todo.deleting) return;
            todo.Completed = false;
            if (!todo.hasOwnProperty('$update'))
                todo = new Todo(todo);
            todo.$update();
        };

    }]);