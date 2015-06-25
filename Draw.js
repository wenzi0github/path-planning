var Draw = {
	//圆
	/*
	 * @param	x		圆的圆心横坐标
	 * @param	y		圆的圆心纵坐标
	 * @param	b		圆的半径
	 * @param	c 		圆的颜色
	 * @param	bool	是否填充
	 * @param	circleId 圆的编号
	 */
	drawCircle : function(x, y, b, c, bool, circleId){
		jc.start('myCanvas');
		b || (b=2);
		c || (c="red");
		jc.circle(x, y, b, c, bool).id(circleId)
		jc.start('myCanvas');
	},
	
	//线
	//points [[x0, y0], [x1, y1], ...]
	drawLine : function(points, color, lw, lineId){
		jc.start('myCanvas');
		jc('#srceen').lineStyle({lineWidth:lw});
		jc.line(points, color).id(lineId);
		jc.start('myCanvas');
	},
	
	//三次贝塞尔曲线
	//points [[x0, y0, x1, y1, x2, y2, x3, y3], [x4, y4, x5, y5, x6, y6, x7, y7], ...]
	drawBezier : function(points, extrapoints, color, lineWidth, fill){
		var t = points.length;
		var pp = [];
		
		var arr = [];
		for(var i=0; i<t; i++){
			var nexti = (i+1)%t;
			arr.push([points[i].x, points[i].y, extrapoints[i*2+1].x, extrapoints[i*2+1].y, extrapoints[nexti*2].x, extrapoints[nexti*2].y, points[nexti].x, points[nexti].y]);
			var p = bezierkey.passPoints(points[i], extrapoints[i*2+1], extrapoints[nexti*2], points[nexti]);
			pp = pp.concat(p);
		}
		jc.start('myCanvas', true);
		jc('#srceen').lineStyle(lineWidth);
		jc.b3Curve(arr,color, fill);
		//jc.b3Curve([[points[i].x, points[i].y, extrapoints[i*2+1].x, extrapoints[i*2+1].y, extrapoints[nexti*2].x, extrapoints[nexti*2].y, points[nexti].x, points[nexti].y]], '#00ffbb');
		jc.start('myCanvas', true);

		return pp;
	},
	
	/*
	 * 在[x, y]处写文本
	 * @param	string		string			要书写的文本内容
	 * @param	x			int				文本左下方的横坐标
	 * @param	y			int				文本左下方的纵坐标
	 * @param	maxWidth	int				文本的最大宽度，如果文本的长度大于maxWidth，则字体的宽度和字体间距会被压缩
	 * @param	color		string|color	字体颜色
	 * @param	fill		bool			是否填充
	 */
	drawText:function(string, x, y, maxWidth, color, fill){
		jc.start('myCanvas');
		jc.text(string, x, y, maxWidth, color, fill);
		jc.start('myCanvas');
	},
	
	//删除id对应的图形
	deleteGraph:function(id){
		jc.start('myCanvas');
		jc(id).del();
		jc.start('myCanvas');
	}
}
