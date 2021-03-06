/**
 * Created by wiley on 2017/6/7.
 */
(function () {
    var datepicker = {};
    var lastDate;
    datepicker.getMonthDate = function (year,month) {
        var ret = [];

        //定义未传日期时的默认日期为本月（月份需要+1）
        if (!year || !month ) {
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth()+1; //
        }

        var firstDay = new Date(year,month-1,1) //系统月份需要-1
        var firstDayWeekDay = firstDay.getDay();//获取当日星期几
        if(firstDayWeekDay == 0) firstDayWeekDay == 7;

        //返回年和月
        year = firstDay.getFullYear();
        month = firstDay.getMonth() + 1;

        //获取上月最后一天的日期
        var lastDayOfLastMonth = new Date(year,month-1,0);
        var lastDateOfLastMonth = lastDayOfLastMonth.getDate()//getDate() 方法可返回月份的某一天。

        //需要显示的上月的天数
        var preMonthDayCount = firstDayWeekDay -1;


        //获取本月最后一天的日期
        var lastDay=new Date(year,month,0);
        lastDate=lastDay.getDate();

        //获取本月数据，月份包含的星期可能为4,5,6,所以需要获取最大星期数6星期的数据。
        for(var i=0;i<7*6;i++) {
            var date = i - preMonthDayCount + 1 ; //本月的第一天的日期，为负值即表示上月的日期
            var showDate = date; //因为date计算可能会有负值，showDay用来将其转化为实际显示的日期，默认为date
            var thisMonth = month; //同样显示的月份需要因为date为负值时变为上一月，thisMonth将其转化为实际显示的月份
            if (date <= 0) {
                //上一月
                thisMonth = month + 1;
                showDate = lastDateOfLastMonth + date; //本条数据的日期为上月的最后一天减去已经显示的天数，得到此日为上月的多少号
            }else if (date > lastDate ){
                //下一月
                thisMonth = month - 1;
                showDate = showDate - lastDate;
            }

            //小于10的日期前加0
            if(showDate<=9){
                showDate="0"+showDate;
            }


            if (thisMonth == 0) thisMonth = 12;
            if (thisMonth == 13)  thisMonth = 1

            ret.push({
                month:thisMonth,
                date:date,
                showDate:showDate,
            })
        }

        return {
            year:year,
            month:month,
            days:ret
        }
    }

    //渲染数据
    var monthDate;
    var $wrapper;
    datepicker.buildUi=function(year,month){
        monthDate = datepicker.getMonthDate(year,month);
        var bodyHtml  = "";
        for(var i=0;i<monthDate.days.length;i++) {
            var date = monthDate.days[i];
            if(i%7==0) {
                bodyHtml += '<tr>';
            }
            if( monthDate.days[i].date<=0 || monthDate.days[i].date > lastDate){
                bodyHtml += '<td class="not" data-date='+date.date+'>' + date.showDate + '</td>'
            }else{
                bodyHtml += '<td data-date='+date.date+'>' + date.showDate + '</td>'
            }

            // bodyHtml += '<td data-date='+date.date+'>' + date.showDate + '</td>'
            if(i%7 ===6) {
                bodyHtml+= '</tr>'
            }
        }
        var datePickerhtml = `  <div class="date-picker-header">
                    <div class="date-head-left date-btn date-btn-prev">&lt;</div>
                    <div class="date-head-mind">${monthDate.year}-${monthDate.month}</div>
                    <div class="dere-head-right date-btn date-btn-next">&gt;</div>
                </div>
                <div class="v-date-body">
                    <table>
                        <thead>
                        <tr>
                            <th>一</th>
                            <th>二</th>
                            <th>三</th>
                            <th>四</th>
                            <th>五</th>
                            <th>六</th>
                            <th>七</th>
                        </tr>
                        </thead>
                        <tbody>
                            ${bodyHtml}
                        </tbody>
                    </table>
                </div>`
        return datePickerhtml;
    }
    //渲染模板
    datepicker.rander = function(monthChange){
        var year,month;

        if(monthDate) {
            year = monthDate.year;
            month = monthDate.month;
        }

        if (monthChange == 'prev') month--;
        if (monthChange == 'next') month++;

        var html = datepicker.buildUi(year,month)
        //只有当主容器不存在时才需要重新渲染主容器，即只有首次绑定组件时渲染主容器，之后渲染只需刷新数据
        if(!$wrapper) {
            $wrapper = document.createElement('div');
            $wrapper.className = 'v-date-picker';
            document.body.appendChild($wrapper);
        }
        $wrapper.innerHTML = html;

    }
    datepicker.init = function (input) {
        datepicker.rander();
        var isOpen = false;
        var $input = document.querySelector('input')
        $input.addEventListener('click',function  (){
            if(isOpen) {
                $wrapper.classList.remove('active')
                isOpen = false
            }else {
                $wrapper.classList.add('active')
                var left = $input.offsetLeft;
                var top = $input.offsetTop;
                var height = $input.offsetHeight;
                $wrapper.style.top = top + height + 5 + 'px';
                $wrapper.style.left = left  + 'px';
                isOpen = true
            }
        },false)

        $wrapper.addEventListener('click',function  (e){
            var $target = e.target;
            if($target.classList.contains('date-btn-prev')){  //上一个月
                datepicker.rander('prev');
            }else if ($target.classList.contains('date-btn-next')) {  //下一个月
                datepicker.rander('next');
            }
        },false)

        $wrapper.addEventListener("click",function (e) {
            var $target = e.target;
            if($target.tagName.toLowerCase() !== 'td') return;
            var date = new Date(monthDate.year,monthDate.month-1,$target.dataset.date);

            $input.value = format(date)

            $wrapper.classList.remove('active')
            isOpen = false

        },false)

        function format(date) {
            var ret = "";
            var padding = function (num) {
                if(num <=9) {
                    return "0" + num;
                }
                return num;
            }

            ret += date.getFullYear() + "-"
            ret += padding(date.getMonth()+1) + "-";
            ret += padding(date.getDate());

            return ret;
        }

    }



    window.datepicker = datepicker;
}())
