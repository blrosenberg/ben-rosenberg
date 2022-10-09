class dt {
    constructor(data, minBucketSize=1, depth=4) {
      this.pts = data.sort((a,b)=>(a.x-b.x))
      this.px = []
      this.py = []
      for (let p of this.pts) {
        this.px.push(p.x)
        this.py.push(p.y)
      }
      this.x_min = this.px[0]
      this.x_max = this.px[this.px.length-1]
      this.partitions = []
      this.depth = depth
      this.bucket = minBucketSize
      this.done = false
      this.tRMSE = 0
    }
    
    ABassign(x) {
      let A = []
      let B = []
      
      for (let i=0;i<this.px.length;i++) {
        if (this.px[i] < x) {
          A.push(this.pts[i])
        } else {
          B.push(this.pts[i])
        }
      }
      
      let Am=0
      let Bm=0
      
      for (let a of A) {
        Am += a.y/A.length
      }
      for (let b of B) {
        Bm += b.y/B.length
      }
      
      return [Am, Bm]
    }
    
    getRMSE(splitPoint, vals, data=this.pts) {
      let A = vals[0]
      let B = vals[1]
      let RMSE = 0
      let SSE = 0
      for (let p of data) {
        let e
        if (p.x<splitPoint) {
          e = p.y-A
        } else {
          e = p.y-B
        }
        SSE += e*e
      }
      RMSE = Math.sqrt(SSE)
      return RMSE
    }
  
    partition(low=0, high=1) {
      let rmse = 0
      let part_x = []
      for (let i=1;i<10;i++) {
        part_x.push(low+i*(high-low)/10)
      }
      
      let errors = []
      let vals = []
      for (let x of part_x) {
        let v = this.ABassign(x)
        vals.push(v)
        errors.push(this.getRMSE(x, v))
      }
      let best = errors.indexOf(min(errors))
      let out = [part_x[best], errors[best], vals[best], low, high]
      this.partitions.push(out)
      return out
    }
    
    dig() {
      if (!this.partitions.length) {
        this.partition()
      } else if (!this.done) {
        let part_x = []
        for (let p of this.partitions) {
          part_x.push(p[3])
          part_x.push(p[0])
          part_x.push(p[4])
        }
        this.partitions = []
        for (let i=0;i<part_x.length-1;i++) {
          this.partition(part_x[i], part_x[i+1])
        }
        if (this.partitions.length > Math.pow(2, this.depth)) {
          this.done=true
        }
      } else {
        console.log('Complete!')
        noLoop();
      }
    }
    
    totalRMSE() {
      this.tRMSE = 0
      for (let p of this.partitions) {
         this.tRMSE += p[1]/this.partitions.length
      }
      return this.TRMSE
    }
    
    show() {
      if (this.partitions.length) {
        this.totalRMSE()
        for (let i=0;i<this.partitions.length;i++) {
          let p = this.partitions[i]
  
          push()
          translate(w*0.1, 0)
          stroke(255, 0, 0)
          line(p[3]*dom, h*0.9-p[2][0]*ran, p[0]*dom, h*0.9-p[2][0]*ran)
          line(p[0]*dom, h*0.9-p[2][1]*ran, p[4]*dom, h*0.9-p[2][1]*ran)
          pop()
          
          text(this.tRMSE.toString(), w*0.6, h*0.95)
        }
      }
    }
    
    
    
  }