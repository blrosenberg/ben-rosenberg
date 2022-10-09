class lm {
    constructor(data, t=0, inc=0.1, sig = 0.01, bounce=0.5) {
      this.x_mean = 0
      this.y_mean = 0
      for (let p of data) {
        this.x_mean += p.x/data.length
        this.y_mean += p.y/data.length
      }
      this.pts = data
      this.theta = t
      this.increment = inc
      this.m = 0
      this.b = ran/2
      this.prevM = this.m
      this.prevB = this.b
      this.rmse = 0
      this.fit = false
      this.sig = sig
      this.bounce = bounce
    }
    
    getVal(x) {
      return this.m*x + this.b
    }
    
    testFit() {
      let prev = this.rmse
      let sse = 0
      for (let p of this.pts) {
        let px = p.x*dom
        let py = p.y*ran
        let e = this.getVal(px)-py
        sse += e*e
      }
      let mse = sse/(n_points)
      this.rmse = Math.sqrt(mse)
    }
    
    regress() {
      if (this.fit) {
        console.log("Complete!")
        noLoop()
      }
      let prev = this.rmse
      this.theta += this.increment
      this.m = tan(this.theta)
      this.b = (this.y_mean - this.m*this.x_mean)*ran
      this.testFit()
      if (prev < this.rmse) {
        this.increment *= -this.bounce
      }
      if (abs(this.m-this.prevM) + abs(this.b-this.prevB) < this.sig) {
        this.fit = true
      }
      this.prevM = this.m
      this.prevB = this.b
    }
    
    show() {
      push()
      translate(w*0.1, 0) //shifts x for axes
      
      //error lines
      push()
      stroke(100, 0, 100)
      strokeWeight(1)
      for (let p of this.pts) {
        line(p.x*dom, h*0.9-p.y*ran, p.x*dom, h*0.9-(this.m*p.x*dom + this.b))
      }
      pop()
      
      //line
      push()
      stroke(255, 0, 0)
      if (this.fit) {
        stroke(0, 255, 0)
      }
      strokeWeight(4)
      line(0, h*0.9-this.b, dom, h*0.9-(this.b+this.m*dom))
      pop()
      
      //pivot point
      push()
      stroke(0, 255, 0)
      strokeWeight(5)
      point(this.x_mean*dom, h*0.9-this.y_mean*ran)
      pop()
      
  
      
      //textbox
      push()
      fill(bg)
      noStroke()
      rect(-w*0.1, h*0.9+1, w, h)
      stroke(100, 0, 100)
      line(w*0.6-this.rmse/2, h*0.98, w*0.6+this.rmse/2, h*0.98)
      pop()
      
      let depth = floor(-Math.log10(this.sig))
      textAlign(CENTER)
      text('y = ' + round(this.m, depth).toString() + 'x + ' + round(this.b, depth).toString(), w*0.1, h*0.95)
      text('RMSE: '+round(this.rmse, 2).toString(), w*0.6, h*0.95)
      pop()
    }
  }