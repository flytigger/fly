(function (ko, $) {
    ko.bindingHandlers.currency = {
        //todo:长度限制
        init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            //加逗号
            var fixNumber = function (value) {
                var v, j, sj, rv = "";
                v = value.replace(/,/g, "").split(".");
                j = v[0].length % 3;
                sj = v[0].substr(j).toString();
                for (var i = 0; i < sj.length; i++) {
                    rv = (i % 3 == 0) ? rv + "," + sj.substr(i, 1) : rv + sj.substr(i, 1);
                }
                var rvalue = (v[1] == undefined) ? v[0].substr(0, j) + rv : v[0].substr(0, j) + rv + "." + v[1];
                if (rvalue.charCodeAt(0) == 44) {
                    rvalue = rvalue.substr(1);
                }
                return rvalue;
            }
            //控制小数点后面的长度
            var fixDecimal = function (value) {
                var decimalCount = allBindings.get('accuracy') || 2;
                var nums = value.toString().split('.');
                if (nums.length > 1) {
                    if (nums[1].length < decimalCount) {
                        var count = decimalCount - nums[1].length;
                        var arrtemp = [];
                        var i = 0;
                        while (i < count) {
                            arrtemp.push(0);
                            i++;
                        }
                        nums[1] += arrtemp.join('');
                    }
                    else if (nums[1].length > decimalCount) {
                        nums[1] = nums[1].substr(0, decimalCount);
                    }
                } else {
                    var arrtemp = [], i = 0;
                    while (i < decimalCount) {
                        arrtemp.push(0);
                        i++;
                    }
                    nums.push(arrtemp.join(''));
                }
                return nums.join('.');
            }
            var getRealValue = function (value) {
                value = value.toString().replace(/,/g, '')
                console.log("getRealValue:" + value);
                return value;
            };
            $(element).focus(function () {
                var value = this.value;
                var temp = value.toString().indexOf('.');
                if (temp == -1) {
                    temp == 0;
                }
                this.selectionStart = temp;
                this.selectionEnd = temp;
                //var $this = $(this);
                //var value = $this.val();
                ////判断是否为数字
                //if (!value || value == '') { value = 0.00; }
                //var index = value.indexOf('.');
                //this.selectionStart = index;
                //this.selectionEnd = index;
                //this.focus();
            });
            $(element).keydown(function (e) {
                //48-57  96-105 8 9 13  46 110 190
                var value = this.value;
                var allowCodeArr = [46, 8, 9, 27, 13, 110];// Allow: backspace, delete, tab, escape, enter and .
                if (value.toString().indexOf('.') == -1) {
                    allowCodeArr.push(190);
                }
                if ($.inArray(e.keyCode, allowCodeArr) !== -1 ||
                    // Allow: Ctrl+A
                    (e.keyCode == 65 && e.ctrlKey === true) ||
                    // Allow: Ctrl+C
                    (e.keyCode == 67 && e.ctrlKey === true) ||
                    // Allow: Ctrl+X
                    (e.keyCode == 88 && e.ctrlKey === true) ||
                    // Allow: home, end, left, right
                    (e.keyCode >= 35 && e.keyCode <= 39)) {
                    // let it happen, don't do anything
                    return;
                }
                // Ensure that it is a number and stop the keypress
                if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                    e.preventDefault();
                }
            });
            $(element).keyup(function (e) {
                /*
                *光标在小数点前
                    1.获取光标起始位置
                 *  2.计算光标起始位置之前有几个逗号
                 *  3.多个逗号+2，不多逗号+1
                 */
                console.log("keycode:" + e.keyCode);
                //跳过左右方向键
                if (e.keyCode == 37 || e.keyCode == 39) { return; }
                //if backspace,
                if (e.keyCode == 8) {
                    var value = this.value;
                    if (value) {
                        var start = this.selectionStart;
                        console.log("start:" + start + " value:" + value);
                        console.log(value.charAt(start));
                        if (value.charAt(start - 1) == ',') {
                            console.log(start);
                            this.selectionStart -= 1;
                            this.selectionEnd -= 1;
                        }
                    }
                }
                var origStart = this.selectionStart;
                var origCommaCount = getChartCount(this.value.toString(), ',', origStart);
                updateValue(getRealValue(this.value));
                var newCommaCount = getChartCount(this.value.toString(), ',', origStart + 1);
                if (newCommaCount > origCommaCount) {
                    origStart += 1;
                }
                this.selectionStart = origStart;
                this.selectionEnd = origStart;
            });
            function getChartCount(str, char, endIndex) {
                endIndex = endIndex || str.length;
                endIndex = str.length <= endIndex ? str.length : endIndex;
                var count = 0;
                for (var i = 0; i < endIndex; i++) {
                    if (str[i] == char) {
                        count++;
                    }
                }
                return count;
            };
            function updateValue(value) {
                if (value == 0) return;
                var valueAcc = valueAccessor();
                value = fixDecimal(value)
                valueAcc(value);
                value = fixNumber(value);
                element.value = value;
            }
        },
        update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        }

    };
})(ko, $)