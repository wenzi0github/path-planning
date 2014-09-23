var Map = {
	qw:[],		//在获取所有通路时标记已经走过的区域
	er:[],		//在获取所有通路时存储所有的通路
	pp:null,
	
	/*
	 * @param	start		{}		起点的坐标		{'x':123, 'y':345}
	 * @param	startArea	int		起点所在的区域  0
	 * @param	end			{}		终点的坐标		{'x':123, 'y':345}
	 * @param	endArea		int		终点所在的区域	2
	 * @param	conn		[]	
	 * @return  
	 */
	way:function(wayPoints){
		var dis   = 10000000;
		var min   = 0;
		
		for(var i=0, t=wayPoints.length; i<t; i++){
			var arr = wayPoints[i];
			var sum = 0;
			for(var j=0, tt=arr.length-1; j<tt; j++){
				sum += this.pointDis(arr[j], arr[j+1]);
			}
			console.log(sum);
			if(sum<dis){
				dis = sum;
				min = i;
			}
		}
		return min;
	},
	
	/*
	 * 动画实现最优路径
	 */
	asd:function(step){
		var p = this.pp;
		if(step>=p.length-1){
			return;
		}
		var dis = this.pointDis(p[step] ,p[step+1]);
		var t   = dis*5;
		$("#startImg").animate({left:p[step+1][0]-12, top:p[step+1][1]-10}, t, 'linear');
		jc.start("screen", true);
		jc.line([p[step], p[step]], "rgb(250, 3, 3)")
			.lineStyle({lineWidth:2})
			.animate({x1:p[step+1][0],y1:p[step+1][1]}, t);
		jc.start("screen", true);
		setTimeout(function(obj,step){
			return function(){obj.asd(step);}
		}(this, ++step),t+100);
		p = null;
	},
	
	//两点之间的距离
	pointDis:function(a, b){
		return Math.sqrt((a[0]-b[0])*(a[0]-b[0])+(a[1]-b[1])*(a[1]-b[1]));
	},
	
	/*
	 * 获取从起点区域到终点区域的所有通路
	 * @param	area	[]		区域的邻接表
	 * @param	start	int		起点所在的区域
	 * @param	end		int		终点所在的区域
	 * @param	brr		[]		暂存从起点区域到终点区域的路径
	 * @return	er		[]		从起点到终点所有的通路
	 */
	aer:function(area, start, k, end, brr){
		this.qw[k] = 1;
		var arr = area[k];
		for(var i=0, t=arr.length; i<t; i++){
			
			if(arr[i]==end){
				var crr = [start].concat(brr);
				crr.push(end);
				this.er.push(crr);
				console.log(crr);
				continue;
			}
			if(this.qw[arr[i]]==1){
				continue;
			}
			
			this.qw[arr[i]] = 1;
			brr.push(arr[i]);
			this.aer(area, start, arr[i], end, brr);
			this.qw[arr[i]] = 0;
			brr.pop();
		}

		return this.er;
	},
	
	/*
	 * 获取相邻区域的公共边
	 * @param	allbound	[]		所有的水平切线
	 * @param	ap			[]		每个区域所包含的边界
	 * @return	brr			[]		相邻区域的公共边
	 */
	connArea:function(allbound, ap){
		var brr = [];
		for(var i=0, t=allbound.length; i<t; i++){
			var arr = this.wh(allbound[i], ap, -1);
			brr[arr[0]+','+arr[1]] = allbound[i];
			brr[arr[1]+','+arr[0]] = allbound[i];
		}
		//console.log(brr);
		return brr;
	},
	
	
	/*
	 * 通过边界明确各个区域的连接关系，构造邻接表
	 */
	areaConn:function(ap){
		var area = [];
		for(var i=0, t = ap.length; i<t; i++){
			area[i] = [];
			$("#tip").append(i+':');
			for(var j=0, tt = ap[i].length; j<tt; j++){
				var arr = this.wh(ap[i][j], ap, i);
				if(arr.length==0){
					continue;
				}
				for(var k=0; k<arr.length; k++){
					area[i].push(arr[k]);
					$("#tip").append(arr[k]+',');
				}
			}
			$("#tip").append('<br/>');
		}
		return area;
	},
	
	/*
	 * 
	 */
	wh:function(arr, ap, z){
		var aa = [];
		for(var i=0, t=ap.length; i<t; i++){
			if(i==z){
				continue;
			}
			for(var j=0, tt=ap[i].length; j<tt; j++){
				var brr = ap[i][j];
				if((arr[2]==brr[2]) && (arr[0]==brr[0] || arr[1]==brr[1])){
					aa.push(i);
				}
			}
		}
		return aa;
	},
};