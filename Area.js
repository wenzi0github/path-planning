Area = {
	boundary : [],	//存储爬虫走过的点
	pp       : [],	//障碍物的边界点
	xextreme : [],	//水平切线的端点和中点
	depth    : 0,   //递归深度，暂未使用
	areaBound: [],	//存储每个区域的边界，方便以后对区域进行连接和计算权值
	
	/*
	 * 递归检索有效区域
	 */
	init:function(left, right, y){
		var leftPoint  = null;
		var rightPoint = null;
		var ex         = null;
		
		console.log(left, right, y);
		leftPoint  = this.find({'x':left, 'y':y});
		if(leftPoint.i==-1){
			this.find({'x':right, 'y':y});	//将另一边的点标记为已访问
			this.areaBound.push([[left, right, y]]);
			Draw.drawText(this.depth, left, y+10, '#FF6666');
			this.depth++;
			console.log('达到边界');
			return;
		}
		if(leftPoint.i != -2){
			ex = this.xextreme[leftPoint.i];
			if(ex.y==y && (ex.right==right || ex.mid==right)){
				this.areaBound.push([[left, right, y]]);
				Draw.drawText(this.depth, left, y+10, '#FF6666');
				this.depth++;
				console.log('这是一个封闭图形');
				return;
			}
		}
		rightPoint = this.find({'x':right, 'y':y});
		if(leftPoint.i==-2 && rightPoint.i==-2){
			console.log('该点已访问过');
			return;
		}
		
		if(leftPoint.i != rightPoint.i){
			console.log(leftPoint.i, rightPoint.i, '出错了！！');
			//alert('出错了！！');
			return;
		}
		Draw.drawText(this.depth, left, y+10, '#FF6666');
		this.depth++;
		
		//console.log(leftPoint, rightPoint);
		

		/*
		 * type表示爬虫爬到的点的类型, boun:地图边界上的点, obs:曲线上的点
		 * mod 表示曲线上的点的类型，  1:向上凸的凸极值点, 2:向下凸的凸极值点, 2:端点
		 */
		 
		
		if(leftPoint.type==='boun' && rightPoint.type==='boun'){
			this.areaBound.push([[left, right, y], [ex.left, ex.mid, ex.y], [ex.mid, ex.right, ex.y]]);
			
			console.log(ex.left, ex.mid, ex.y);
			console.log(ex.mid, ex.right, ex.y);
			console.log('===============================');
			if(parseInt(ex.lvisited)==0){
				ex.lvisited = 1;
				this.init(ex.left, ex.mid, ex.y);
			}if(parseInt(ex.rvisited)==0){
				ex.rvisited = 1;
				this.init(ex.mid, ex.right, ex.y);
			}
		}else if(leftPoint.type=='boun' && rightPoint.type=='obs'){
			if(rightPoint.mod==1){
				this.areaBound.push([[left, right, y], [ex.left, ex.mid, ex.y]]);
				
				console.log(ex.left, ex.mid, ex.y);
				console.log('===============================');
				this.init(ex.left, ex.right, ex.y);
				this.init(ex.mid, ex.right, ex.y);
			}else if(rightPoint.mod==2){
				this.areaBound.push([[left, right, y], [ex.left, ex.mid, ex.y], [ex.mid, ex.right, ex.y]]);
				
				console.log(ex.left, ex.mid, ex.y);
				console.log(ex.mid, ex.right, ex.y);
				console.log('===============================');
				this.init(ex.left, ex.mid, ex.y);
				this.init(ex.mid, ex.right, ex.y);
			}else if(rightPoint.mod==3){
				this.areaBound.push([[left, right, y], [ex.left, ex.mid, ex.y]]);
				
				console.log(ex.left, ex.mid, ex.y);
				console.log('===============================');
				this.init(ex.left, ex.mid, ex.y);
			}
		}else if(leftPoint.type=='obs' && rightPoint.type=='boun'){
			if(leftPoint.mod==1){
				this.areaBound.push([[left, right, y], [ex.left, ex.mid, ex.y], [ex.mid, ex.right, ex.y]]);
				
				
				console.log(ex.left, ex.mid, ex.y);
				console.log(ex.mid, ex.right, ex.y);
				console.log('===============================');
				if(parseInt(ex.lvisited)==0){
					ex.lvisited = 1;
					this.init(ex.left, ex.mid, ex.y);
				}if(parseInt(ex.rvisited)==0){
					ex.rvisited = 1;
					this.init(ex.mid, ex.right, ex.y);
				}
			}else if(leftPoint.mod==0){
				this.areaBound.push([[left, right, y], [ex.mid, ex.right, ex.y]]);
				
				console.log(ex.mid, ex.right, ex.y);
				console.log('===============================');
				if(parseInt(ex.lvisited)==0){
					ex.lvisited = 1;
					this.init(ex.left, ex.right, ex.y);
				}if(parseInt(ex.rvisited)==0){
					ex.rvisited = 1;
					this.init(ex.left, ex.mid, ex.y);
				}
			}
		} 
		
		//console.log(this.areaBound);
		return this.areaBound;
	},
	
	/*
	 * 计算两点之间的距离
	 * @param	x1		float	第一个点的横坐标
	 * @param	y1		float	第一个点的纵坐标
	 * @param	x2		float	第二个点的横坐标
	 * @param 	y2		float	第二个点的纵坐标
	 * @return	s		float	两个点之间的距离
	 */
	pointSpace:function(x1, y1, x2, y2){
		return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
	},
	
	/*
	 * 根据point点的坐标找出爬虫下一个暂停的位置
	 * @param	point	{}	当前爬虫的位置			{'x':100.3632, 'y':467.2387}
	 * @return	p		{}	下一个爬虫停止的位置	{'type':'boun', 'mod':2, 'i':2}
	 */
	find:function(point){
		if(point.x==0 || point.x==800){
			var x     = point.x;
			var prey  = Math.floor(point.y);	//point上一个整数点
			var nexty = Math.ceil(point.y);		//point下一个整数点
			if(prey==0 || typeof this.boundary['x'+x+'y'+nexty]=='undefined'){
				while(true){
					var i = this.isBetween(x, nexty, nexty+1);
					//console.log(prey);
					this.boundary['x'+x+'y'+nexty] = 1;
					if(i>-1){
						return {'type':'boun', 'mod':2, 'i':i};
					}
					nexty++;
					if(nexty>=601){
						return {'type':'boun', 'mod':2, 'i':-1};
					}
				}
			}else if(typeof this.boundary['x'+x+'y'+prey]=='undefined'){
				while(true){
					var i = this.isBetween(x, prey-1, prey);
					this.boundary['x'+x+'y'+prey] = 1;
					if(i>-1){
						return {'type':'boun', 'mod':2, 'i':i, 'x':x, 'y':nexty};
					}
					prey--;
					if(prey<=-1){
						
						return {'type':'boun', 'mod':2, 'i':-1, 'x':x, 'y':nexty};
					}
				}
			}else{
				return {'type':'boun', 'mod':2, 'i':-2};
			}
		}else{
			// 如果point在障碍物的边界上
			var local    = this.contains(point);//根据该point点的坐标求出该点所在的曲线和该曲线上的位置
			var i        = parseInt(local[0]);	//该point点所在的曲线
			var j        = parseInt(local[1]);	//该point点在i曲线上的位置
			var obstacle = this.pp[i];			//把i曲线单独拿出来，放到obstacle变量中
			var t        = obstacle.length;		//求出obstacle的长度
			
			var nextj = (j+1)%t;
			var prej  = (j+t-1)%t;
			
			var minx   = 0;
			var maxx   = 0;
			var miny   = 0;
			var maxy   = 0;
			
			//console.log(this.boundary['x'+obstacle[nextj].x+'y'+obstacle[nextj].y], this.boundary['x'+obstacle[prej].x+'y'+obstacle[prej].y]);
			
			if(obstacle[nextj].y>=point.y && obstacle[nextj].x<=point.x && typeof this.boundary['x'+obstacle[nextj].x+'y'+obstacle[nextj].y]=='undefined'){
				while(true){
					var nextj = (j+1)%t;
					var j     = nextj;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[prej].y>=point.y && obstacle[prej].x<=point.x && typeof this.boundary['x'+obstacle[prej].x+'y'+obstacle[prej].y]=='undefined'){
				while(true){
					var prej = (j+t-1)%t;
					var j    = prej;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[nextj].y>=point.y && obstacle[nextj].x>=point.x && typeof this.boundary['x'+obstacle[nextj].x+'y'+obstacle[nextj].y]=='undefined'){
				while(true){
					var nextj = (j+1)%t;
					var j     = nextj;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[prej].y>=point.y && obstacle[prej].x>=point.x && typeof this.boundary['x'+obstacle[prej].x+'y'+obstacle[prej].y]=='undefined'){
				while(true){
					var prej = (j+t-1)%t;
					var j    = prej;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[nextj].y<=point.y && obstacle[nextj].x<=point.x && typeof this.boundary['x'+obstacle[nextj].x+'y'+obstacle[nextj].y]=='undefined'){
				while(true){
					var nextj = (j+1)%t;
					var j     = nextj;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[prej].y<=point.y && obstacle[prej].x<=point.x && typeof this.boundary['x'+obstacle[prej].x+'y'+obstacle[prej].y]=='undefined'){
				while(true){
					var prej = (j+t-1)%t;
					var j    = prej;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[nextj].y<=point.y && obstacle[nextj].x>=point.x && typeof this.boundary['x'+obstacle[nextj].x+'y'+obstacle[nextj].y]=='undefined'){
				while(true){
					var nextj = (j+1)%t;
					var j     = nextj;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else if(obstacle[prej].y<=point.y && obstacle[prej].x>=point.x && typeof this.boundary['x'+obstacle[prej].x+'y'+obstacle[prej].y]=='undefined'){
				while(true){
					var prej = (j+t-1)%t;
					var j    = prej;
					if(obstacle[j].status==1){
						var k = this.whExtreme(obstacle[j]);
						return {'type':'obs', 'mod': obstacle[j].type, 'i':k};
					}
					this.boundary['x'+obstacle[j].x+'y'+obstacle[j].y]=1;
				}
			}else{
				return {'type':'boun', 'mod':2, 'i':-2};
			}
		}
	},
	
	
	
	/*
	 * 检测point点在哪个障碍物上的哪个位置
	 * @param	point	{}	
	 * @return  local	[i, j]	在第i个障碍物的j位置
	 */
	contains : function(point){
		var arr = this.pp;
		for(var i in arr){
			for(var j in arr[i]){
				if(arr[i][j].x==point.x && arr[i][j].y==point.y){
					return [i, j];
				}
			}
		}
		//return -1;
	},
	
	/*
	 * 检测arr中的y值是否在(x, y1),(x, y2)之间
	 * 用于判断边界的爬虫是否找到了水平切线的端点
	 * @param	x	int	边界的x值  x=0 || x==800
	 * @param	y1	int
	 * @param	y2  int	两个点的y值
	 * @return	i	int	如果找到切线的端点则返回端点在数组中的位置，否则返回-1
	 * */
	isBetween:function(x, y1, y2){
		var ex = this.xextreme;
		var t  = ex.length;
		var local = '';
		if(x==0){
			local = 'left';
		}else if(x==800){
			local = 'right';
		}else{
			alert('传入参数错误');
			return;
		}
		for(var i=0; i<t; i++){
			if(ex[i][local]==x && ((ex[i]['y']>=y1&&ex[i]['y']<y2) || (ex[i]['y']>=y2&&ex[i]['y']<y1))){
				return i;
			}
		}
		return -1;
	},
	
	/*
	 * 返回point点在极值点集合中的位置
	 * @param	point		{}		水平切线的端点和中点
	 * @param	xextreme	{}		水平切线的端点和中点的集合
	 * @return	local		int		point点在xextreme集合中的位置
	 */
	whExtreme:function(point){
		var ex = this.xextreme;
		var x  = point.x;
		var y  = point.y;
		for(var i=0, t=ex.length; i<t; i++){
			if(ex[i].y==y && (ex[i].left==x || ex[i].mid==x || ex[i].right==x)){
				return i;
			}
		}
	}
}