export const useSocketHook = (userId: number) =>{
    let socket = null
    if(!socket){
      socket = new WebSocket(`ws://localhost:8080/echo?Id=${userId}`)
    }
    return { socket }
  }