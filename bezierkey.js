var bezierkey = {
	//判断数组arr中是否含有s元素
	contains : function(arr, s){
		for(var i in arr){
			if(arr[i].x==s.x && arr[i].y==s.y){
				return true;
			}
		}
		return false;
	},
	
	/*
	 * 计算由4个点确定的贝塞尔曲线都经过哪些点
	 * @author	bing
	 * @param	
	 */
	passPoints : function(point0, point1, point2, point3){
		var pp = [];
		
		for(var t=0.0; t<=1; t+=0.01){
			var x = Math.pow(1-t, 3)*point0.x + 3*Math.pow(1-t, 2)*t*point1.x + 3*Math.pow(t, 2)*(1-t)*point2.x + Math.pow(t, 3)*point3.x;
			var y = Math.pow(1-t, 3)*point0.y + 3*Math.pow(1-t, 2)*t*point1.y + 3*Math.pow(t, 2)*(1-t)*point2.y + Math.pow(t, 3)*point3.y;
			
			x = x.toFixed(4);
			y = y.toFixed(4);
			
			pp.push({'x':x, 'y':y, 'type':3});
		}
		return pp;
	},
	
	/*
	 * 获取一个完整的曲线中的凸极值点
	 * @author	bing
	 * @param	pp			整条曲线的点的坐标集合
	 * @return 	extreme		凸极值点的集合
	 */
	getExtreme:function(pp){
		function s(point, pp, type){
			var x = parseFloat(point.x);
			var y = parseFloat(point.y);
			
			var t = pp.length;
			var num =0;
			for(var i=0; i<t; i++){
				var nexti = (i+1)%t;
				pp[i].y = parseFloat(pp[i].y);
				pp[i].x = parseFloat(pp[i].x);
				pp[nexti].x = parseFloat(pp[nexti].x);
				//
				if((type==0?pp[i].y>y:pp[i].y<y) && ((pp[i].x>=x && pp[nexti].x<x) || (pp[i].x<=x && pp[nexti].x>x))){
					num++;
				}
			}
			return num;
		}
		
		var t = pp.length;
		var extreme = [];
		for(var i=0; i<t; i++){
			var prei  = (i+t-1)%t;
			var nexti = (i+1)%t;

			//console.log(arr.length);
			
			//取出来的竟然是字符串，靠
			//pp[i].x = parseFloat(pp[i].x);
			pp[i].y     = parseFloat(pp[i].y);
			pp[prei].y  = parseFloat(pp[prei].y);
			pp[nexti].y = parseFloat(pp[nexti].y);

			if(pp[i].y<pp[prei].y && pp[i].y<pp[nexti].y){
				//向上凸
				var num = s(pp[i], pp, 0);
				if(num%2==1){
					pp[i].type = 0;
					pp[i].status = 1;
					extreme.push(pp[i]);
				}
			}else if(pp[i].y>pp[prei].y && pp[i].y>pp[nexti].y){
				//向下凸
				var num = s(pp[i], pp, 1);
				if(num%2==1){
					pp[i].type = 1;
					pp[i].status = 1;
					extreme.push(pp[i]);
				}
			}
		}
		return extreme;
	},
	
	/*
	 * 从凸极值点处做切线，返回切线的起点和终点的x值
	 * @author	bing
	 * @param	extreme		切线点
	 * @param	pp			边界的点的集合
	 * @return	{}			切线的起点和终点的x值
	 */
	tangentPoint:function(extreme, pp){
		var xmin  = 0;		//默认起点的横坐标
		var xmax  = 800;	//默认终点的横坐标
		
		var begin = 800;	//起点距离切线点的距离
		var end   = 800;	//终点距离切线点的距离
		
		var imin  = 1000;	//求出的左边的交点在哪个曲线上
		var imax  = 1000;	//求出的右边的交点在哪个曲线上
		
		var ii    = 0;
		var jj    = 0;
		
		extreme.x = parseFloat(extreme.x);
		extreme.y = parseFloat(extreme.y);
		for(var j=0, tt=pp.length; j<tt; j++){
			var ppp = pp[j];
			for(var i=0, t=ppp.length; i<t; i++){
				var nexti = (i+1)%t;
				ppp[i].x = parseFloat(ppp[i].x);
				ppp[i].y = parseFloat(ppp[i].y);
				ppp[nexti].y = parseFloat(ppp[nexti].y);
				if((ppp[i].y<=extreme.y&&extreme.y<ppp[nexti].y) || (ppp[nexti].y<extreme.y&&extreme.y<=ppp[i].y)){
					if(extreme.x-ppp[i].x>0 && extreme.x-ppp[i].x<begin){
						xmin  = ppp[i].x;
						imin  = j;
						ii    = i;
						begin = extreme.x-ppp[i].x;
					}else if(ppp[i].x-extreme.x>0 && ppp[i].x-extreme.x<end){
						xmax = ppp[i].x;
						imax = j;
						jj   = i;
						end  = ppp[i].x-extreme.x;
					}
				}
			}
		}
		if(imin!=1000){
			pp[imin].splice(ii+1, 0, {'x':xmin, 'y':extreme.y, 'status':1, 'type':2});
		}if(imax!=1000){
			pp[imax].splice(jj+1, 0, {'x':xmax, 'y':extreme.y, 'status':1, 'type':2});
		}
		return {'xmin':xmin, 'xmax':xmax};
	},
	
	/*
	 * 计算额外点的坐标
	 * @author 	bing
	 * @param	points		[]		用户点击的点的坐标
	 * @return	extrapoints	[]		额外点的坐标
	 */
	getExtra:function(points){
		var scale = 0.6;
		var t   = points.length;
		var mid = [];
		var m   = [];
		var extrapoints = [];
		//中间点
		for(var i=0; i<t; i++){
			var nexti = (i+t-1)%t;
			var x     = (points[i].x+points[nexti].x)/2.0;
			var y     = (points[i].y+points[nexti].y)/2.0;
			mid[i] = {'x':x, 'y':y};
		}
		for(var i=0; i<t; i++){
			var nexti = (i+1)%t;
			var x     = (mid[i].x+mid[nexti].x)/2.0;
			var y     = (mid[i].y+mid[nexti].y)/2.0;
			m[i] = {'x':x, 'y':y};
			
			var offsetx = points[i].x - m[i].x;
			var offsety = points[i].y - m[i].y;
			
			var j = i * 2;
			extrapoints[j] = {'x':mid[i].x + offsetx, 'y':mid[i].y + offsety};
			
			var ofx = (points[i].x - extrapoints[j].x)*scale;
			var ofy = (points[i].y - extrapoints[j].y)*scale;
			extrapoints[j].x = points[i].x - ofx;
			extrapoints[j].y = points[i].y - ofy;
			extrapoints[(j+1)%(2*t)] = {'x':points[i].x + ofx, 'y':points[i].y + ofy};
		}
		return extrapoints;
	},
	
	/*
	 * 计算一元三次方程的实数根，盛金公式
	 * @author	bing
	 * @param	x1		float	第一个系数
	 * @param	x2		float	第二个系数
	 * @param	x3		float	第三个系数
	 * @param	x		float	等号右边的得数
	 * @return	ans		[]		实数根的集合
	 */
	equation:function(x0, x1, x2, x3, x){
		if(x==x0){
			return [0];
		}else if(x==x3){
			return [1];
		}
		var a = 3*x1-x0+x3-3*x2;
		var b = 3*x2+3*x0-6*x1;
		var c = 3*(x1-x0);
		var d = x0-x;
		
		var A = (b*b - (3*a*c)).toFixed(5);
		var B = (b*c - (9*a*d)).toFixed(5);
		var C = (c*c - (3*b*d)).toFixed(5);
		var D = (B*B - 4*A*C).toFixed(5);//判别式
		
		//console.log(A+';'+B+';'+C+';'+D);

		var ans = [];
		
		if(A==0 && B==0){
			ans.push((-b)/(3*a));
		}else if(D>0){
			var y1 = A*b+3*a*((Math.pow(D, 0.5)-B)/2);
			var y2 = A*b+3*a*((-Math.pow(D, 0.5)-B)/2);
			
			y1 = y1.toFixed(5);
			y2 = y2.toFixed(5);

			//Math.pow(x, 1/3)x竟然不能为负
			if(y1<0){
				y1 = -(Math.pow(-y1, 1/3));
			}else{
				y1 = Math.pow(y1, 1/3);
			}
			if(y2<0){
				y2 = -(Math.pow(-y2, 1/3))
			}else{
				y2 = Math.pow(y2, 1/3);
			}
			
			ans.push((-b-(y1+y2))/(3*a));
		}else if(D==0){
			var k = B/A;
			
			ans.push(-(b/a)+k);
			ans.push(-(k/2));
		}else{
			var u = Math.acos((2*A*b-3*a*B)/(2*Math.pow(A, 3/2)));	//(A>0)
			u = ((u*180)/3.1415926).toFixed(3);
			ans.push((-b-2*Math.pow(A, 0.5)*Math.cos(u/3))/(3*a));
			ans.push((-b+Math.pow(A, 0.5)*(Math.cos(u/3)+Math.pow(3, 0.5)*Math.sin(u/3)))/(3*a)); 
			ans.push((-b+Math.pow(A, 0.5)*(Math.cos(u/3)-Math.pow(3, 0.5)*Math.sin(u/3)))/(3*a));
		}
		
		return ans;
	}
};