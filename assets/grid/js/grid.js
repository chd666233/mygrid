(function(root,fn,plug){
			fn(root.jQuery,plug);
		}(window?window:this,function($,plug){

			$.fn[plug]=function(options){
				var __DEFAULTS__={
				head:[],
				data:[],
				sort:0,//不排序
        currPg:1,
				start:1,
				stop:10,
				pageSize:0,
				url:false
			}
			
			var __PROTO__={
				_init:function(){
					var $this=this;
					if(this.options.url){
						$.ajax({
							type: "GET",
						  	url:this.options.url,
						  	dataType: "json",
							beforeSend:function(){
								lg("===before===");
							},
							success:function(data,textStatus){
//							    console.log(this);
								$this.options.data=data;
								lg("===success===");
								$this.inhtml();
								var ht=$this.find('.col').height();
								$this.find('.col').css('height',ht);
								$this._handle(data);
								$this.options.pageSize=Math.ceil($this.options.data.length/($this.options.stop-$this.options.start+1));
								$this.options.oldDatas=$this.options.data.concat();///////////////3-1不排序的旧数据不要被更新所以放在这里,需要复制数组不能简单引用，不然oldDatas会被改变
								$this.options.fstSta=$this.options.start;//分页算法需要第一页的开始数据保留
								$this.toggle();
							},
							error:function(XMLHttpRequest, textStatus, errorThrown){
								lg(textStatus);
								lg(errorThrown);
								lg("===error===");
							},
							complete:function(){
								lg("===complete===");
							}
						})
					}else{
						// lg("===vvv===");
					 	this.inhtml();
					 	var ht=this.find('.col').height();
					 	this.find('.col').css('height',ht);
					 	this._handle();
					 	this.options.pageSize=Math.ceil(this.options.data.length/(this.options.stop-this.options.start+1));
						this.options.oldDatas=this.options.data.concat();///////////////3-1不排序的旧数据不要被更新所以放在这里,需要复制数组不能简单引用，不然oldDatas会被改变
						this.options.fstSta=this.options.start;//分页算法需要第一页的开始数据保留
						this.toggle();
					}
				},
				_render:function(){},
				_handle:function(data){
	
					var _this=this;
					this.find('.head').on('mousedown',function(e){	
						_this._col=$(this).parents('.col');
						//_this.changestyle(_this);	
						$(this).parents('.col').siblings().addClass('trans');
						var dX=e.clientX;
						var dY=e.clientY;
						var i=0;
						_this.move=false;/////////////////6-3 重置
						_this.on('mousemove',function(e){
							if(Math.abs(e.clientX-dX)<2&&Math.abs(e.clientY-dY<2))return;
							var lf=_this.find('.grid').position().left;
							var tp=_this.find('.grid').position().top;
							if(i==0){
								_this.clone=_this._col.clone().appendTo('.grid').addClass("dragging");
								_this.clone.css({top:e.clientY-tp,left:e.clientX-lf});
								i++;
								return;
							}
							_this.clone.css({top:e.clientY-tp,left:e.clientX-lf});
							_this.dragging=true;
						  _this.move=true;/////////////////6-1 发生了移动
				
						}).on('mouseup',function(){
							_this.find('.dragging').remove();
							_this.off('mousemove').find('.col').off('mousemove');
							if(!_this.dragging)return;
							if(_this._col.attr('value')&&_this._col.attr('value')=='dright'){	
								_this.lastCol.after(_this._col[0]);
								_this._col.addClass('down2');
							}else if(_this._col.attr('value')&&_this._col.attr('value')=='dleft'){
								_this.lastCol.before(_this._col[0]);
								_this._col.addClass('down2');
							}
							_this.find('.col').removeClass('down down2').attr('value','');
							_this.dragging=false;
					    })
					}).on('click',function(){
						/////////////////6-2 发生了移动返回，非常重要的一步是6-3,必须在down的时候重置，因为down在click之前
						/////move在中间，最后是click，如果发生了移动不执行，移动结束后发生点击通过down重置move，就不会导致click不能执行
						if(_this.move)return;
						//_this.options.sort被所有列共享不好，一列变成了2,另一列再去排序变成0，点击看起来没有反应
						if($(this).parents('.col').siblings().find('.f').hasClass('fa')){
							_this.options.sort=0;
							$(this).parents('.col').siblings().find('.f').removeClass('fa fa-sort-numeric-asc fa-sort-numeric-desc fa-sort-alpha-asc fa-sort-alpha-desc')
						}

						switch(++_this.options.sort){
							case 0:
							_this.sort($(this).text());
							$(this).children('.f').removeClass('fa fa-sort-numeric-asc fa-sort-numeric-desc fa-sort-alpha-asc fa-sort-alpha-desc');
							_this.pagging(_this.options.currPg);
	
							var listSize=_this.options.stop-_this.options.start;
							if(_this.options.currPg==_this.options.pageSize){
								listSize=_this.options.data.length-_this.options.start;
							}
							
							for(var i=0;i<=listSize;i++){
								_this.find('.col ul').each(function(j){
									var li=$(this).children()[i];
									var liHt=li.offsetHeight;
									var liY=li.offsetTop;
									var ulHt=$(this).height();
									$(li).css({'transform':'translateY('+(ulHt/2-liY+liHt/2)+'px)','opacity':'0'});
								})
							}
              setTimeout(function(){
								_this.find('.col li').css({'transition':'transform 1s ease '+0+'s,opacity 1s','transform':'translateY(0px)','opacity':'1'});
							},10)
							break;
							case 1:	
							if(/(^(\d+)|(\d+\.\d+)&)|(^\d{4}-\d{2}-\d{2})/.test($(this).next().children()[0].innerHTML)){
								$(this).children('.f').addClass('fa fa-sort-numeric-asc').removeClass('fa-sort-numeric-desc');
							}else{
								$(this).children('.f').addClass('fa fa-sort-alpha-asc').removeClass('fa-sort-alpha-desc');
							}
							_this.sort($(this).text());
							_this.pagging(_this.options.currPg);
							var listSize=_this.options.stop-_this.options.start;
							if(_this.options.currPg==_this.options.pageSize){
								listSize=_this.options.data.length-_this.options.start
							}
							for(var i=0;i<=listSize;i++){
								_this.find('.col ul').each(function(){
									var li=$(this).children()[i];
									var liHt=li.offsetHeight;
									var liY=li.offsetTop;
									var _mWt=_this.find('.grid').width();
									var _mHt=_this.find('.grid').height();
									$(li).css({'transform':'translateY(-'+(100+liY)+'px)','opacity':'0'});

									// setTimeout(function(){
									// 	$(li).css({'transition':'transform 1s ease '+0+'s,opacity 1s','transform':'translate(0px)','opacity':'1'});
									// },10)

									
								})
							}
							setTimeout(function(){
								_this.find('.col li').css({'transition':'transform 1.5s ease '+0+'s,opacity 1s','transform':'translate(0px)','opacity':'1'});
							},10)
							break;
							case 2:
							if(/(^(\d+)|(\d+\.\d+)&)|(^\d{4}-\d{2}-\d{2})/.test($(this).next().children()[0].innerHTML)){
								$(this).children('.f').addClass('fa fa-sort-numeric-desc').removeClass('fa-sort-numeric-asc');
							}else{
								$(this).children('.f').addClass('fa fa-sort-alpha-desc').removeClass('fa-sort-alpha-asc');
							}
							_this.sort($(this).text());
							_this.options.sort=-1;
							_this.pagging(_this.options.currPg);
							var listSize=_this.options.stop-_this.options.start;
							if(_this.options.currPg==_this.options.pageSize){
								listSize=_this.options.data.length-_this.options.start
							}
							for(var i=0;i<=listSize;i++){
								_this.find('.col ul').each(function(){
									var li=$(this).children()[i];
									var liHt=li.offsetHeight;
									var liY=li.offsetTop;
									var _mWt=_this.find('.grid').width();
									var _mHt=_this.find('.grid').height();
									$(li).css({'transform':'translateY('+(_mHt-liY+100)+'px)','opacity':'0'});
								})
							}
							setTimeout(function(){
								_this.find('.col li').css({'transition':'transform 1.5s ease '+0+'s,opacity 1s','transform':'translate(0px)','opacity':'1'});
							},10)	
							break;
						}     		    
					}).parents('.col').on('mouseenter',function(e){
						if(!_this._col)return;
						if(!_this.dragging)return;
						_this.lastCol=$(this);
						if(_this.lastCol.index()>_this._col.index()){//左边进来
							_this._col.attr('value','dright');
							$(this).addClass('down');
						}else if(_this.lastCol.index()<_this._col.index()){
							_this._col.attr('value','dleft');
							$(this).addClass('down');
						}else{
							_this._col.attr('value','');
						}
					}).on('mouseleave',function(){
						$(this).removeClass('down');
					});

					this.find('.toolbar .fistPg').on('click',function(){
						_this.options.currPg!=1&&_this.pagging(_this.options.currPg=1);
						_this.toggle();
					}).next().on('click',function(){
						_this.options.currPg!=1&&_this.pagging(--_this.options.currPg);
						_this.toggle();
					}).nextAll('.currPg').on('change',function(){
						_this.pagging(_this.options.currPg=$(this).val());
						_this.toggle();
					}).nextAll('.next').on('click',function(){
						_this.options.currPg!=_this.options.pageSize&&_this.pagging(++_this.options.currPg);
						_this.toggle();		
					}).next().on('click',function(){
						_this.options.currPg!=_this.options.pageSize&&_this.pagging(_this.options.currPg=_this.options.pageSize);
						_this.toggle();
					})
				},
				//传入_this，因为是2个作用域
				inhtml:function(){
					this.html('<div class="grid">'+
						            '<div class="data"></div>'+
						            '<div class="toolbar">'+
						            	'<div class="tb"><span class="view">View 0-1 of 1</span></div>'+
											'<div class="tb">'+
												'<i class="fa fa-step-backward fistPg close" title="第一页"></i>&nbsp;&nbsp;'+
								               ' <i class="fa fa-backward prev close" title="上一页"></i>'+
								               ' <span class="l">&nbsp;&nbsp; | &nbsp;&nbsp;</span> Page <input class="currPg" type="number"'+
								               ' min="1" max="1" value="1"> of <span class="pgSize">1</span><span class="l">&nbsp;&nbsp;|&nbsp;&nbsp; </span>'+
								                '<i class="fa fa-forward next close" title="下一页"></i>&nbsp;&nbsp;'+
								               ' <i class="fa fa-step-forward lastPg close" title="最后一页"></i>'+
							               ' </div>'+
						           ' </div>'+
						        '</div>')
					var html='';
					var _this=this;//////////////////////1.
					$.each(this.options.head,function(i){
						$.each(_this.options.head[i],function(k,v){
							// lg(_this.options.head[i].width);//////////3分号
							(k=='text')&&(html+='<div class="col" style="width:'+_this.options.head[i].width+'">'+
										'<div class="head">'+
											'<h6>'+v+'</h6>'+
											'<i class="f"></i>'+
										'</div>'+
										'<ul></ul>'+
									'</div>');
						})
					})
					this.find('.data').html(html);
					this.inDatas(this.options.start,this.options.stop);
				},
				inDatas:function(start,stop){
					var _this=this;
					for(var i=start-1;i<=stop-1;i++){
						//////////////////////////////////////////////////////////4-1完美，也可以不用不过会多循环几次，但没有找到内容也就不会添加li,加了这行可以阻止无意义的循环
							if(i>_this.options.data.length)return;
							$.each(_this.options.data[i],function(k,v){
							_this.find('.head:contains('+k+')').next().append('<li>'+v+'</li>');
						})
					}
				},
				pagging:function(currPg){
					/* start:
					 2+size*0+0  
					 2+size*1+1   
					 2+size*2+2
					 2+size*3+3  */
					currPg=parseInt(currPg);
					var listSize=this.options.stop-this.options.start+1;/////////////4-2不需要计算最后一页的数据量了
					// this.options.start=(currPg-1)*listSize+1;  
					// this.options.stop=currPg*listSize;
					this.options.start=this.options.fstSta+(listSize-1)*(currPg-1)+currPg-1;
					this.options.stop=this.options.start+listSize-1;
					this.find('.data ul').html('');
					this.inDatas(this.options.start,this.options.stop);
				},
				toggle:function(){
					var fistPg=this.find('.fistPg');
					var prev=fistPg.next();
					var currPg=this.find('.currPg');
					var pgSize=currPg.next(); 
					var next=this.find('.next');
					var lastPg=next.next();
					var view=this.find('.view');
					currPg.val(this.options.currPg)
					currPg.attr('max',this.options.pageSize);
					pgSize.text(this.options.pageSize);
					view.text('View '+this.options.start+"-"+this.options.stop+" of "+this.options.data.length);

					if(this.options.pageSize==this.options.currPg&&this.options.currPg==1){
						fistPg.addClass('close');
						prev.addClass('close');
						next.addClass('close');
						lastPg.addClass('close');
						view.text('View '+this.options.start+"-"+this.options.data.length+" of "+this.options.data.length);
					}else{
						if(this.options.currPg>1&&this.options.currPg<this.options.pageSize){
							fistPg.removeClass('close');
							prev.removeClass('close');
							next.removeClass('close');
							lastPg.removeClass('close');
						}else if(this.options.currPg>1&&this.options.currPg==this.options.pageSize){
							fistPg.removeClass('close');
							prev.removeClass('close');
							next.addClass('close');
							lastPg.addClass('close');
							view.text('View '+this.options.start+"-"+this.options.data.length+" of "+this.options.data.length);
						}else if(this.options.currPg==1&&this.options.currPg<this.options.pageSize){
							fistPg.addClass('close');
							prev.addClass('close');
							next.removeClass('close');
							lastPg.removeClass('close');
						}
					}
				},
				sort:function(sortFiledName){
					var _this=this;
					if(this.options.sort==0){
						this.options.data=this.options.oldDatas.concat();////////////////3-2.这里要再次复制，不然接下来全部都指向oldDatas，oldDatas一样被排序改变
					}else if(this.options.sort==1){//升序  >0  ojb1在ojb2后面
						this.options.data.sort(function(obj1,obj2){
							// lg(typeof obj1[sortFiledName] =='string')
							if(typeof obj1[sortFiledName] =='string'){
								if(/^\d+$/.test(obj1[sortFiledName])){
									return parseInt(obj1[sortFiledName])-parseInt(obj2[sortFiledName])
								}
								return obj1[sortFiledName].localeCompare(obj2[sortFiledName]);
							}else{
								return obj1[sortFiledName]-obj2[sortFiledName];
							}
						})
					
					}else{//倒序  <0  ojb1在ojb2前面
						this.options.data.sort(function(obj1,obj2){
							// lg(obj1[sortFiledName] instanceof String)
							if(typeof obj1[sortFiledName] =='string'){
								if(/^\d+$/.test(obj1[sortFiledName])){
									return parseInt(obj2[sortFiledName])-parseInt(obj1[sortFiledName])
								}
								return obj2[sortFiledName].localeCompare(obj1[sortFiledName]);
							}else{
								return obj2[sortFiledName]-obj1[sortFiledName];
							}
						})
					}
				},
				changestyle:function(_this){
					var lf=[];
					var tp=[];
					var gridht=_this.find('.grid').height();
					var gridwt=_this.find('.grid').width();
					var colht=_this._col.height();
					_this.find('.col').each(function(){
						lf.push($(this).position().left);
						tp.push($(this).position().top);	
					})
					_this.find('.col').each(function(i){
						$(this).css({'position':'absolute','left':lf[i],'top':tp[i]});
					})
					_this.find('.grid').css({'width':gridwt,'height':gridht});
					_this.find('.toolbar').css('margin-top',colht);
				}
			}
			this.options=$.extend(__DEFAULTS__,options);
			$.extend(this,__PROTO__);
			this._init();
			}
		},"grid"))
