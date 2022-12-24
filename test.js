const { DataState, Window, Textbox, Element } = require("./index.js")



var w = new Window({address: "127.0.0.1", port: 1234}, {plot_id: 88});



var a = w.add_subplot({top:1,bottom:2,left:1,right:2},{
    width : 600,
    height : 400,
    margins : {
      top: 30, right: 20, bottom: 30, left: 50
    },
    xlim : [0,20],
    ylim : [0,4.0],
    xlabel : "Time Since (sec)",
    ylabel : "Value"
  });
  
  let state_text = new DataState.SingleValue();
  
  Textbox.write(w, {top:2,bottom:3,left:1,right:3}, {title:"Platform.state"},[
    {
      datastate: state_text, 
      config: { postprocessor: (t)=>t+" yee yee", color: "#aa00ff"}
    }
  ]);
  
  var a2 = w.add_subplot({top:1,bottom:2,left:2,right:3},{
    width : 600,
    height : 600,
    margins : {
      top: 30, right: 20, bottom: 30, left: 50
    },
    xlim : [-2.5,2.5],
    ylim : [-0.05,4.95],
    xtick_count: 10,
    title : "Flow Map"
  });
  
  
  
  let voltage = new DataState.TimeSince({tmax_seconds:20});
  let current = new DataState.TimeSince({tmax_seconds:20});
  
  a.plot(voltage, {scolor:"steelblue"});
  a.plot(current, {scolor:"green"});
  
  let body_pose=new DataState.Pose();
  let head_pose=new DataState.Pose();
  
  //let body_cov=new DataState.Covariance2d(body_pose);
  
  
  let trajectory = new DataState.Trajectory({tmax_seconds:5});
  
  a2.plot(trajectory, {scolor:"red"})
  
  
  let landscape = new DataState.Path()
  
  console.log("Datastate ID:" + landscape.id)
  
  let landscape_element = a2.plot(landscape, {scolor:"#0000aa"})
  
  
  console.log(a2.select_datastate_by_id(landscape.id))
  
  a2.add_element(new Element.Pointer(body_pose, {fcolor:"#000000aa"}));
  a2.add_element(new Element.Pointer(head_pose, {fcolor:"#aa0000aa", skewness: 4, width:0.05}));
  
  //a2.add_element(new Element.Covariance2d(body_cov, {scolor: "#aa00aa85", nsig: 1}));
  //a2.add_element(new Element.Covariance2d(body_cov, {scolor: "#aa00aa56", nsig: 2}));
  //a2.add_element(new Element.Covariance2d(body_cov, {scolor: "#aa00aa2d", nsig: 3}));
  
  //let mat = new DataState.MatrixRGBBottomCenter({dimensions:[50,50]});
  
  //a2.imshow(mat, {dimensions:[50,50]});
  
  
  
  point = new DataState.Point()
  point.x = -1
  point.y = 4
  a2.add_element(new Element.Circle(point, {fcolor:"#00ff00aa", radius: 1}));
  
  
  w.init();
  w.start();
  
  setInterval(()=>{
    // body_cov.covariance = [[Math.random()/10, 0],  
    //                       [0, Math.random()/10]]
  },1000)
  
  setTimeout(()=>{
    landscape.set([...Array(30)].map((d,i) => ({x: 0.1*i, y: 0.01*i**2})))
  },1000)
  
  setTimeout(()=>{
    a2.remove_element(landscape_element)
  },3000)
  
  setInterval(()=>{
    voltage.push(Math.random()+1)
    current.push(Math.random()+3)
  }, 100)
  
  var iter = [...Array(50)]
  let randcolor = ()=>[parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255)]
  
  setInterval(()=>{
    // DISCO!!
    //mat.update(iter.map((d)=>iter.map((d)=>randcolor())));
  }, 1000)
  
  
  var t0 = Date.now();
  
  setInterval(()=>{
    t = (Date.now()-t0)*5e-4
    body_pose.x = 2*Math.sin(t);
    body_pose.y = 2-2*Math.cos(t);
    body_pose.heading = Math.PI/2 - t;
  
    body_pose.copy_to(head_pose)
  
    head_pose.heading += 0.4*Math.sin(t*5)
  
    trajectory.push(body_pose)
  
  },30)
  
  setInterval(()=>{
    state_text.value="Heloo"
  }, 1000)