'use strict';

angular.module('infinite')
    .controller('InfiniteCtrl2', function ($scope, $timeout, $window, $q) {

        $window = angular.element($window);

        $scope.params = {
            lineHeight: 36,
            numTotalRows: 300000,
            debugPaging: true,

            recalcParams: function () {
                this.numRowsPerPage = Math.floor($window.innerHeight / this.lineHeight) * 3;
                this.maxPageNum = Math.floor(this.numTotalRows / this.numRowsPerPage) - 1;
            }
        };

        $scope.params.recalcParams();
        if ($scope.params.debugPaging) {
            $scope.prevPageStyle = {background: 'rgba(255,0,0,0.2)'};
            $scope.mainPageStyle = {background: 'rgba(255,255,255,1.0)'};
            $scope.nextPageStyle = {background: 'rgba(0,0,255,0.2)'};
        }

        $scope.viewport = {
            windowTop: 0,
            windowBottom: $window.innerHeight,

            readViewportInfo: function () {
                this.windowTop = $window.scrollTop;
                this.windowBottom = $window.innerHeight + $window.scrollTop;
            }
        };
        $scope.viewport.readViewportInfo();


        function DataPage(pageNum, dataPromise) {
            this.pageNum = pageNum;
            var p = this;
            dataPromise.then(function (data) {
                p.pageSize = data.length;
                p.data = data;
                p.height = data.length * $scope.params.lineHeight;
            });
        }

        function getData(offset, numRows) {
            var deferred = $q.defer();
            var dataArray = [];
            for (var i = 0; i < numRows; i++) {
                dataArray.push({row: i + offset});
            }
            deferred.resolve(dataArray);
            return deferred.promise;
        }

        $scope.paging = {
            prevPageOffset: 0,
            prevPageNum: 0,
            postTableSpacerHeight: 0,

            calcPrevPageOffset: function () {
                if ($scope.prevPage.height) {
                    var calculatedPageNum = Math.max(Math.round((-1 * $scope.table.top) / $scope.prevPage.height) - 1, 0);
                    $scope.paging.prevPageNum = Math.min(calculatedPageNum, ($scope.params.maxPageNum - 2));
                    $scope.paging.prevPageOffset = $scope.paging.prevPageNum * $scope.params.lineHeight * $scope.params.numRowsPerPage;
                    $scope.paging.postTableSpacerHeight = Math.max($scope.totalTableHeight - $scope.paging.prevPageOffset - $scope.params.lineHeight - $scope.prevPage.height - $scope.mainPage.height - $scope.nextPage.height, 0);
                }
            }
        };

        function getPage(pageNum) {
            return new DataPage(pageNum, getData(pageNum * $scope.params.numRowsPerPage, $scope.params.numRowsPerPage));
        }

        function reloadAllPages(fromPrevPage) {
            $scope.prevPage = getPage(fromPrevPage);
            $scope.mainPage = getPage(fromPrevPage + 1);
            $scope.nextPage = getPage(fromPrevPage + 2);
        }

        reloadAllPages(0);
        function scrollOneForward(newPrevPageNum) {
            $scope.prevPage = $scope.mainPage;
            $scope.mainPage = $scope.nextPage;
            $scope.nextPage = getPage(newPrevPageNum + 2);
        }

        function scrollOneBack(newPrevPageNum) {
            $scope.nextPage = $scope.mainPage;
            $scope.mainPage = $scope.prevPage;
            $scope.prevPage = getPage(newPrevPageNum);
        }

        $scope.totalTableHeight = $scope.params.numTotalRows * $scope.params.lineHeight;

        $scope.table = {
            top: 0,
            height: 0,
            readTablePos: function (params) {
                var el = document.querySelector('#t');
                $scope.table.top = el.getBoundingClientRect().top + params.lineHeight;
                $scope.table.height = el.getBoundingClientRect().height - params.lineHeight;
            }
        };

        $scope.table.readTablePos($scope.params);

        $scope.paging.calcPrevPageOffset();

        $scope.busy = false;

        var handler = function () {
            if (!$scope.busy) {
                $scope.busy = true;
                $timeout(function () {
                    $scope.params.recalcParams();
                    $scope.viewport.readViewportInfo();
                    $scope.table.readTablePos($scope.params);

                    var lastPrevPageNum = $scope.paging.prevPageNum;
                    $scope.paging.calcPrevPageOffset();
                    var newPrevPageNum = $scope.paging.prevPageNum;

                    if (newPrevPageNum === (lastPrevPageNum - 1)) {
                        scrollOneBack(newPrevPageNum);
                    } else if (newPrevPageNum === (lastPrevPageNum + 1)) {
                        scrollOneForward(newPrevPageNum);
                    } else {
                        reloadAllPages(newPrevPageNum);
                    }

                    $scope.$digest();
                    $scope.busy = false;
                }, 500);
            }
        };
        $window.on('scroll', handler);
        $scope.$on('$destroy', function () {
            return $window.off('scroll', $scope.handler);
        });
    });
