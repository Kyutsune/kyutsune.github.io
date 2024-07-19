#include "image.h"
#include "image_io.h"
#include "vec.h"
#include <cmath>
#include <limits>
#include <random>

const float inf= std::numeric_limits<float>::infinity();

Color LightBlue( )
{
    return Color(0.530, 0.807, 0.980);;
}

Color OliveDrab( )
{
    return Color(0.419, 0.556, 0.137);;
}

struct Plan
{
    Point a;        // point sur le plan
    Vector n;       // normale du plan
    Color color;    // couleur
};

struct Sphere
{
    Point o;
    float r;
    Color color;
};

struct Hit
{
    float t;        // position sur le rayon, ou inf s'il n'y a pas d'intersection
    Point p;        // position du point, s'il existe
    Vector n;       // normale du point d'intersection, s'il existe
    Color color;    // couleur du point d'intersection, s'il existe

    Hit( ) : t(inf), p(), n(), color() {}     // pas d'intersection
};

struct Scene
{
    std::vector<Sphere> spheres;
    Plan plan;
};

Hit intersect( const Plan& plan, const Point& o, const Vector& d, const float tmax )
{
    Hit reponse;
    float t=  dot (plan.n , Vector (o , plan.a ) ) / dot (plan.n , d ) ;
    Point p= o+t*d;
   

    if(t < 0 || t > tmax)
        return reponse;    // renvoie une intersection non valide / par defaut. l'intersection n'est pas valide / derriere l'origine du rayon
    else
    {
        reponse.t=t;
        reponse.p=p;
        reponse.n=plan.n;
        reponse.color=plan.color;
        return reponse;    // renvoie la position de l'intersection, + la normale et la couleur du plan
    }
        
}

Hit intersect( const Sphere& sphere, const Point& o, const Vector& d, const float tmax )
{
    Hit reponse;
    float a = dot(d, d);
    float b = 2 * (dot(d, o - sphere.o));
    float k = dot(o - sphere.o, o - sphere.o) - sphere.r * sphere.r;

    float det = b * b - 4 * a * k;
    if (det < 0)
        return reponse;

    // Calculer les 2 racines / intersections
    float t1 = (-b + sqrt(det)) / (2 * a);
    float t2 = (-b - sqrt(det)) / (2 * a);

    // Renvoyer l’intersection la plus proche de la caméra
    // On vérifie aussi si la sphère est devant la caméra

    float plus_proche = inf ;
    if ( t1 > 0 && t1 < plus_proche && t1 < tmax )
    {
        plus_proche=t1;
    }
    if ( t2 > 0 && t2 < plus_proche && t2 < tmax )
    {
        plus_proche=t2;
    }
    if(plus_proche!=inf)
    {
        reponse.t=plus_proche;
        reponse.p=o+plus_proche*d;
        reponse.n = Vector(sphere.o,reponse.p);  // Calculer et normaliser la normalee
        reponse.color=sphere.color;
        return reponse;
    }
    else return reponse;

}

Color calcul_lumière(Point p,Vector n,Color color)
{
    Vector l= {0,3,-1}; // direction source de lumièere
    Color emission { 255,255,255 }; // lumièere emise par la source


    float cos_theta = std :: max (float(0),dot(normalize (n),normalize(l)));
    if ( cos_theta < 0) 
        cos_theta = 0;
    Color result= (color * emission * cos_theta) ;

    // Clamping des composantes à 255 si elles dépassent
    result.r = std::min(static_cast<float>(result.r), 255.0f);
    result.g = std::min(static_cast<float>(result.g), 255.0f);
    result.b = std::min(static_cast<float>(result.b), 255.0f);

    return result;
}

Hit intersect( const Scene& scene, const Point& o, const Vector& d )
{
    float plus_proche= inf;
    Hit intermed;
    for(unsigned i= 0 ; i < scene.spheres.size(); i++)
    {
        // tester la ieme sphere
        Hit h= intersect(scene.spheres[i], o, d, inf);
        if(h.t<plus_proche)
        {
            plus_proche=h.t;
            intermed.t=h.t;
            intermed.p=h.p;
            intermed.n=h.n;
            intermed.color=h.color;
            intermed.color=calcul_lumière(scene.spheres[i].o,d,intermed.color);
        }
    }

    // et bien sur, on n'oublie pas le plan...
    
    Hit h= intersect(scene.plan, o, d, inf);
    if(h.t<intermed.t && h.t>0)
    {
        intermed.t=h.t;
        intermed.p=h.p;
        intermed.n=h.n;
        intermed.color=h.color;
    }
    return intermed;
}

bool Ombre(const Scene& scene, const Point& p, const Vector& l, float tmax)
{
    Hit ombreHit = intersect(scene, p+0.001*l, l);
    if(ombreHit.t>0 && ombreHit.t<tmax)
    {
        return true;
    }
    return false;
}

int main( )
{
 // cree l'image resultat
    Image image(512, 512);    // par exemple...

    int aa=5;

    Point l= {0,3,-1};

    Scene scene;
    Plan plan;
    Sphere Sphere1;
    Sphere Sphere2;

    plan.a=Point(0,-1,0);
    plan.n=Vector(0,1,0);
    plan.color=OliveDrab();

    Sphere1.r=1;
    Sphere1.o=Point(0,1,-3);
    Sphere1.color=Blue();

    Sphere2.r=1;
    Sphere2.o=Point(2,0,-4);
    Sphere2.color=Red();

    scene.plan=plan;
    scene.spheres.push_back(Sphere1);
    scene.spheres.push_back(Sphere2);

   
    Hit hitScene;   

    float tmax=inf;

    for(int py= 0; py < image.height(); py++)
    {
        for(int px= 0; px < image.width(); px++)
        {  

            std::default_random_engine rng;
            std::uniform_real_distribution <float> uniform;
            Color pixel;
            for ( int pa = 0; pa < aa ; pa ++)
            {
                float ux = uniform ( rng ) ; 
                float uy = uniform ( rng ) ;

                image(px, py) = LightBlue();

                Point o= Point(0, 0, 0);    // origine
                float x= float ( px + ux ) / float ( image . width () ) * 2 -1;
                float y= float ( py + uy ) / float ( image . height () ) * 2 -1;
                float z= -1;
                Point e= Point (x , y , z) ;            // extremite
                Vector d= Vector(o, e);     // direction : extremite - origine
                
                hitScene=intersect(scene,o,d);          

                if(hitScene.t != inf)
                {
                    Vector DirectionLum = Vector(hitScene.p,l);
                    if (!Ombre(scene, hitScene.p, DirectionLum, tmax))
                    {
                        pixel=pixel + hitScene.color; 
                        image(px, py) = hitScene.color;
                    }
                    else
                    {
                        hitScene.color=Black();                  
                        image(px, py) = hitScene.color;
                    
                    }
                    image(px, py) = Color(pixel / aa,1);
                }
            }
            
            
           /*
            if(hitPlan.t < hitSphere.t && hitPlan.t != inf)
            {
                image(px,py)= hitPlan.color;
            }


            if(hitSphere.t < hitPlan.t && hitSphere.t != inf)
            {
                Sphere.color=calcul_lumière(Sphere.o,d,Sphere.color);
                image(px,py)=Color( Sphere.color,1);
            
            }

            */
        }

    }
    write_image(image, "image.png");
    return 0;
}



