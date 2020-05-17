boids = []
boids_count = 70
boid_rad = 6
max_vel = 0.6

momentum_term = 0.97
r_separation = 12
w_separation = 2.7
r_alignment = 25
w_alignment = 1.5
r_cohesion = 15
w_cohesion = 1.6

class Boid:
    def __init__(self):
        self.pos = PVector(random(width), random(height))
        self.vel = PVector(random(-1,1), random(-1,1))
        self.v_separation = PVector(0,0)
        self.n_alignment = 0
        self.v_alignment = PVector(0,0)
        self.n_cohesion = 0
        self.v_cohesion = PVector(0,0)
        
    def update(self, others):
    
        # Set all behaviour vectors
        for other in others:
            distance = 0;
            # don't check against self
            if self != other:
                # get the distance
                distance = self.pos.dist(other.pos)
                self.separation(other, distance)
                self.alignment(other, distance)
                self.cohesion(other,distance)
                
        # Average alignment behaviour
        if self.n_alignment != 0:
            self.v_alignment.div(self.n_alignment)
            
        # Average cohesion behaviour and subtract current pos to get actual dir
        if self.n_cohesion != 0:
            self.v_cohesion.div(self.n_cohesion)
            self.v_cohesion.sub(self.pos)
            
        # Velocity formula     
        self.v_separation.normalize()
        self.v_alignment.normalize() 
        self.v_cohesion.normalize()
        self.vel.x = momentum_term * self.vel.x + (1 - momentum_term) * (w_separation * self.v_separation.x + w_alignment * self.v_alignment.x + w_cohesion * self.v_cohesion.x)
        self.vel.y = momentum_term * self.vel.y + (1 - momentum_term) * (w_separation * self.v_separation.y + w_alignment * self.v_alignment.y + w_cohesion * self.v_cohesion.y)

        self.vel.setMag(max_vel)

        self.pos.add(self.vel)
        self.screen_wrap()
        
        self.v_separation.setMag(0)
        self.v_alignment.setMag(0)
        self.v_cohesion.setMag(0)
        self.n_cohesion = 0
        self.n_alignment = 0
        
    def screen_wrap(self):
        if self.pos.x > width:
            self.pos.x = 0
        elif self.pos.x < 0:
            self.pos.x = width
            
        if self.pos.y > height:
            self.pos.y = 0
        elif self.pos.y < 0:
            self.pos.y = height
        
    def separation(self, other, distance):
        sum_radius = r_separation + r_separation
        if distance < sum_radius:
            self.v_separation.x += self.pos.x - other.pos.x
            self.v_separation.y += self.pos.y - other.pos.y
            
    def alignment(self, other, distance):
        sum_radius = r_alignment + r_alignment
        if distance < sum_radius:
            self.n_alignment += 1
            self.v_alignment.add(other.vel)
            
    def cohesion(self, other, distance):
        sum_radius = r_cohesion + r_cohesion
        if distance < sum_radius:
            self.n_cohesion += 1
            self.v_cohesion.add(other.pos)
            
        
    def draw(self):
        noStroke()
        fill(102)
        #circle(self.pos.x, self.pos.y, boid_rad)
        push();
        translate(self.pos.x, self.pos.y)
        rotate(self.vel.heading() - PI / 2)
        beginShape(TRIANGLES)
        vertex(0,  5)
        vertex(-3, -3)
        vertex(3, -3)
        endShape()
        pop()

def setup():
    size(400,400)
    for i in range(boids_count):
        boids.append(Boid())
    
def draw():
    background(190)
    for boid in boids:
        boid.update(boids)
        boid.draw()
