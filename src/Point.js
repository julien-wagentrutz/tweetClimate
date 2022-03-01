import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
const fbxLoader = new FBXLoader()

export default class Point {
    constructor(latitude,longitude,scene,pointsMesh,points,pointsHover,r, country,group) {

        this.scene = scene
        this.points = points
        this.pointsMesh = pointsMesh
        this.pointsHover = pointsHover
        this.hover = 0
        this.country = country
        this.group = group
        this.latitude = latitude
        this.longitude = longitude
        this.r = r

        this.hoverSphere = new THREE.Mesh(
            new THREE.BoxGeometry( 0.15, 0.15, 1 ),
            new THREE.MeshBasicMaterial({opacity:0, transparent:true})
        );

        fbxLoader.load( 'model/push_pin/untitled.fbx',  ( gltf ) =>  {


            this.mesh = gltf.children[0]

            const PI = 3.14159265358979323846264338327950288419716939937510582
            const lt =  latitude * (PI/180)
            const lg =  -longitude * (PI/180)
            this.mesh.position.x = r * Math.cos(lt) * Math.cos(lg)
            this.mesh.position.y = r * Math.sin(lt)
            this.mesh.position.z = r * Math.cos(lt) * Math.sin(lg)
            this.hoverSphere.position.set(this.mesh.position.x,this.mesh.position.y,this.mesh.position.z)
            this.mesh.geometry.applyMatrix4( new THREE.Matrix4().makeRotationX( -PI  ) );
            this.mesh.scale.set(1.5,1.5,1.5)
            this.mesh.lookAt(0,0,0)
            this.hoverSphere.lookAt(0,0,0)
            this.pointsMesh[this.hoverSphere.id] = this.mesh
            this.points[this.hoverSphere.id] = this
            this.pointsHover.push(this.hoverSphere)
            this.group.add(this.mesh)
            this.group.add(this.hoverSphere)
        }, undefined, function ( error ) {

            console.error( error );

        } );
        return this
    }
}