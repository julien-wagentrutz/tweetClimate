import * as THREE from 'three'
import {Pane} from 'tweakpane';
import Point from "./Point";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


/**
 * Base
 */

const contentDom = document.querySelector('section')
const exitDom = document.querySelector('.exit')
const countryTextDom = document.querySelector('.country_text')
const tweetTextDom = document.querySelector('.tweet')
const fromTextDom = document.querySelector('.tweet_date span')
const profilImgDom = document.querySelector('.profil_img img')
const nameImgDom = document.querySelector('.profil_text .name')
const surnameImgDom = document.querySelector('.profil_text .surname')
const tempDom = document.querySelector('.temp_text')
let earthBase = false

exitDom.addEventListener('click', ()=>
{
    contentDom.classList.remove('appear')
    earthBase = true
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */

const sizesEarth = 5

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
/**
 * WORLD
 */

const world = new THREE.Group();
scene.add(world)

/*
    Model
 */

/*
    COORDONNÉES
 */


const points = []
const pointsMesh = []
const pointsHover = []

const getCountry = async () => {
    const response = await fetch('https://firetweetapi.julienwagentrutz.com/country', {mode: 'cors'});
    // const response = await fetch('https://127.0.0.1:8000/country/', {mode: 'cors'});
    const responseJson = await response.json();

    responseJson.forEach(country =>
    {
        const lt = country['countryid']['latitude']
        const lg = country['countryid']['longitude']
        const pt = new Point(parseInt(lt),parseInt(lg), scene,pointsMesh,points,pointsHover, sizesEarth, country,world)
    })

}
const getTemp = async (countryId) => {
    const response = await fetch('https://firetweetapi.julienwagentrutz.com/temperature/' + countryId, {mode: 'cors'});
    const responseJson = await response.json();
    let m = 0
    let count = 0;
    max = 0
    for(let i = 1961; i <= 2019; i++)
    {
        isNaN(parseFloat(responseJson[0]['y'+i]))  ?  m+= 0 :  m+= parseFloat(responseJson[0]['y'+i])
        isNaN(parseFloat(responseJson[0]['y'+i])) ? temperatures[count] =  0 : temperatures[count] = parseFloat(responseJson[0]['y'+i])
        if(max < Math.abs(temperatures[count]))
        {
            max = Math.abs(temperatures[count])
        }
        count++
    }

    tempDom.innerHTML = m/58 >0 ? '+' +(Math.round((m/58)*100)/100) : '-' + (Math.round((m/58)*100)/100)
}

const getTweet = async (countryId) => {
    const response = await fetch('https://firetweetapi.julienwagentrutz.com/tweet/' + countryId, {mode: 'cors'});
    const responseJson = await response.json();
    tweetTextDom.innerHTML = responseJson[0].message
    const date = new Date(responseJson[0].author.createdAt)
    fromTextDom.innerHTML = responseJson[0].author.location + " " + date.toLocaleDateString("fr")
    profilImgDom.src = responseJson[0].author.profileImgUrl
    nameImgDom.innerHTML = responseJson[0].author.name
    surnameImgDom.innerHTML = "@"+ responseJson[0].author.username
}

const country = getCountry()

/**
 * Debug panel
 */

const parameters =
    {
        color: '#8dF',
        latitude: 0,
        longitude: 0
    }

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = sizesEarth * 2
scene.add(camera)

// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true
// controls.enableZoom = false

const bump = new THREE.TextureLoader().load('textures/bump.jpg')

/*
    Raycaster
 */

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove( event ) {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
window.addEventListener( 'mousemove', onMouseMove, false );


/*
    Click sensor
 */

let onClick = false;
let onAnim = false;
document.addEventListener('click',()=>{onClick = true})


/*
    Click Drag
 */

let mouseDown = false,
    mouseX = 0,
    mouseY = 0;

function onMouseMoveMove(evt) {
    if (!mouseDown) {
        return;
    }

    evt.preventDefault();

    var deltaX = evt.clientX - mouseX,
        deltaY = evt.clientY - mouseY;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    rotateScene(deltaX, deltaY);
}

function onMouseDown(evt) {
    evt.preventDefault();
    onAnim = false
    mouseDown = true;
    mouseX = evt.clientX;
    mouseY = evt.clientY;
}

function onMouseUp(evt) {
    evt.preventDefault();

    mouseDown = false;
}

function addMouseHandler() {
    window.addEventListener('mousemove', function (e) {
        onMouseMoveMove(e);
    }, false);
    window.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    }, false);
    window.addEventListener('mouseup', function (e) {
        onMouseUp(e);
    }, false);
}

function rotateScene(deltaX, deltaY) {
    world.rotation.y += deltaX / 200;
    world.rotation.x += deltaY / 200;
}

addMouseHandler()

/**
 * clouds
 */
const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(sizesEarth + 0.08, 32, 32),
    new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/clouds-min.png'),
        transparent: true,
    })
);
world.add(clouds)
/*
    GALAXY
 */


const galaxy = new THREE.Mesh(
    new THREE.SphereGeometry(sizesEarth * 5, 64, 64),
    new THREE.MeshBasicMaterial({
        map:  new THREE.TextureLoader().load('textures/galaxy-min.png'),
        side: THREE.BackSide,
    })
);

/*
    Earth
 */

let textureEarth = new THREE.TextureLoader().load('textures/earth.jpeg')

const earth = new THREE.Mesh(
    new THREE.SphereGeometry( sizesEarth, 320,320 ),
    new THREE.MeshPhongMaterial({
        map: textureEarth,
        // side: THREE.FrontSide,
        // wireframe: true,
        displacementMap: bump,
        displacementScale: 0.3,
        // bumpMap: new THREE.TextureLoader().load('textures/bump2.jpg'),
        bumpScale:   0.005,
        specularMap:  new THREE.TextureLoader().load('textures/water-min.png'),
        specular: new THREE.Color('grey')      })
);
world.add(earth)
const axesHelper = new THREE.AxesHelper( 300 );
axesHelper.position.set(0,0,6)
// scene.add( axesHelper );

/*
LIGHT
 */
scene.add(new THREE.AmbientLight(0x999999));

let light = new THREE.DirectionalLight(0xffffff, 0.3);
light.position.set(5,3,5);
// scene.add(light);

scene.add(galaxy)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
let currentObject;
/**
 * Animate
 */
const pi = 3.14159265358979323846264338327950288419716939937510
const clock = new THREE.Clock()
let lastElapsedTime = 0
let count = 0
let xAnim = true
let yAnim = true
let change = 0
let earthAnim = false
let earthAnimDirection = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    //light
    light.position.set(camera.position.x -10,camera.position.y + 10,camera.position.z)
    light.lookAt(0,0,0)

    // rotation clouds
    clouds.rotation.y +=  deltaTime *0.005
    clouds.rotation.x +=  deltaTime *0.009
    //Raycaster

    points.forEach( item =>
    {
        if(item.hover == 0 && item.mesh.scale.x > 1.5)
        {
            const scale =  item.mesh.scale.x - deltaTime * 2.6
            item.mesh.scale.set(scale,scale,scale)
        }
        document.body.style.cursor = 'auto';
        item.hover = 0
    })
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera( mouse, camera );

    // calculate objects intersecting the picking ray
    if(points.length > 0)
    {
        let intersects = raycaster.intersectObjects(pointsHover);
        for ( let i = 0; i < intersects.length; i ++ ) {

            document.body.style.cursor = 'pointer';

            if(pointsMesh[intersects[ i ].object.id].scale.x < 3)
            {
                points[intersects[ i ].object.id].hover = 1
                const scale = pointsMesh[intersects[ i ].object.id].scale.x + deltaTime * 2.8
                pointsMesh[intersects[ i ].object.id].scale.set(scale,scale,scale);
            }

            if(onClick)
            {
                onClick = false
                earthAnim = true
                earthAnimDirection = true
                onAnim = true
                currentObject = pointsMesh[intersects[ i ].object.id]
                contentDom.classList.add("appear")
                countryTextDom.innerHTML = points[intersects[ i ].object.id].country.countryid.countryname
                getTweet(points[intersects[ i ].object.id].country.countryid.id)
                getTemp(points[intersects[ i ].object.id].country.countryid.id)

            }

        }
    }
    if(earthAnim && earthAnimDirection)
    {
        let scaleEarth = Math.max(0.8, world.scale.x - deltaTime * .7)
        world.scale.set(scaleEarth,scaleEarth,scaleEarth)
        world.position.x = Math.max(-10.5, world.position.x - deltaTime * 14)
        if((world.position.x <= -10.5) ){earthAnim = false }
    }
    if(earthBase)
    {
        let scaleEarth = Math.min(1, world.scale.x + deltaTime * .7)
        world.scale.set(scaleEarth,scaleEarth,scaleEarth)
        world.position.x = Math.min(0, world.position.x + deltaTime * 10)
        if((world.position.x >= 0) ){earthBase = false }
    }
    if(onAnim)
    {
        let vw = new THREE.Vector3()
        let vp = new THREE.Vector3()
        const step = 0.015

        const w = world.getWorldDirection(vw)
        const p = currentObject.getWorldDirection(vp)
        if(p.x != -0.6 && xAnim)
        {
            if(p.x < -0.6)
            {
                world.rotation.y -= step
                if(currentObject.getWorldDirection(vp).x > -0.6)
                {
                    xAnim = false
                }
                else
                {
                    change = 0
                }
            }
            else if(p.x > -0.6)
            {
                world.rotation.y += step
                if(currentObject.getWorldDirection(vp).x < -0.6)
                {
                    xAnim = false
                }
                else
                {
                    change = 0
                }
            }
        }

        if(p.y != 0 && yAnim)
        {
            if(p.y < 0)
            {
                world.rotation.x += step
                if(currentObject.getWorldDirection(vp).y > 0)
                {
                    yAnim = false
                }
                else
                {
                    change = 0
                }
            }
            else if(p.y > 0)
            {
                world.rotation.x -= step
                if(currentObject.getWorldDirection(vp).y < 0)
                {
                    yAnim = false
                }
                else
                {
                    change = 0
                }
            }
        }
        if(change){onAnim = false}
        if(!yAnim && !xAnim ){xAnim = true; yAnim = true; change = 1}

    }
    onClick = false
    // Update controls
    // controls.update()
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()