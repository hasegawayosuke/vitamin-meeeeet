function main () {
  'use strict'
  if (navigator.mediaDevices._getUserMedia !== undefined) return
  const video = document.createElement('video')
  const canvas = document.createElement('canvas')
  const canvasCtx = canvas.getContext('2d')
  let videoType = 'camera'
  let videoSubtype = ''
  const audioContext = new AudioContext()
  const audioOutput = audioContext.createMediaStreamDestination()
  canvas.width = 1920
  canvas.height = 1080

  debugger // eslint-disable-line no-debugger
  const startComposite = (contraints) => {
    let img
    let cameraStream
    const draw = () => {
      canvasCtx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height)
      if (img) {
        canvasCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      }
      if (videoType === 'composite') requestAnimationFrame(draw)
    }
    (async () => {
      if (cameraStream === undefined) {
        cameraStream = await navigator.mediaDevices._getUserMedia(contraints)
      }
      video.srcObject = cameraStream
      video.muted = true
      video.loop = false
      video.onloadedmetadata = () => video.play()
    })()
    const vfile = document.getElementById('vfile')
    if (vfile.files && vfile.files.length) {
      try {
        const file = vfile.files[0]
        const url = window.URL.createObjectURL(file)
        const _img = new Image()
        _img.addEventListener('load', (evt) => {
          const w = evt.srcElement.width
          const h = evt.srcElement.height
          img = _img
          img.width = w
          img.height = h
        }, false)
        _img.src = url
      } catch (e) {
        console.error(e)
      }
    }
    draw()
  }
  const meetConnected = (node1, node2) => {
    try {
      const html1 =
        `<table>
          <tr>
            <td><label for="vfile">動画</label></td>
            <td><input type="file" accept="video/mp4,image/*" id="vfile"></td>
            <td>
              <select id="vtype" title="切り替え後はいったんカメラをオフ→オンにする必要があります。">
                <option value="camera">カメラ</option>
                <option value="file">ファイル</option>
                <option value="composite">合成</option>
              </select>
            </td>
          </tr>
          <tr>
            <td><label for="afile">効果音</label></td>
            <td><input type="file" accept="audio/mpeg" id="afile"></td>
          </tr>
        </table>`
      const html2 = '<audio controls id="audio-control">'
      node1.insertAdjacentHTML('beforeend', html1)
      node2.insertAdjacentHTML('afterbegin', html2)
      const startCapture = () => {
        const vfile = document.getElementById('vfile')

        if (videoType === 'camera') {
          return
        }

        if (videoType === 'file' && (!vfile.files || !vfile.files.length)) {
          videoSubtype = 'image'
          const draw = () => {
            const patterns = [
              /* eslint-disable no-multi-spaces */
              ['rgb(180, 180, 180)',    0,   0, 274, 660], ['rgb(180, 180,  12)',  275,   0, 274, 660],
              ['rgb( 13, 180, 180)',  549,   0, 274, 660], ['rgb( 13, 180,  12)',  823,   0, 274, 660],
              ['rgb(180,  16, 180)', 1097,   0, 274, 660], ['rgb(180,  15,  14)', 1371,   0, 274, 660],
              ['rgb( 15,  15, 180)', 1645,   0, 274, 660], ['rgb( 15,  15, 180)',    0, 661, 274,  91],
              ['rgb( 16,  16,  16)',  275, 661, 274,  91], ['rgb(180,  16, 180)',  549, 661, 274,  91],
              ['rgb( 16,  16,  16)',  823, 661, 274,  91], ['rgb( 13, 180, 180)', 1097, 661, 274,  91],
              ['rgb( 16,  16,  16)', 1371, 661, 274,  91], ['rgb(180, 180, 180)', 1645, 661, 274,  91],
              ['rgb(  8,  29,  66)',    0, 752, 320, 273], ['rgb(235, 235, 235)',  320, 752, 320, 273],
              ['rgb( 44,   0,  92)',  640, 752, 320, 273], ['rgb( 16,  16,  16)',  960, 752, 320, 273],
              ['rgb( 24,  24,  24)', 1280, 752, 320, 273], ['rgb( 16,  16,  16)', 1600, 752, 320, 273]
              /* eslinat-enable no-multi-spaces */
            ]
            patterns.forEach((p) => {
              canvasCtx.fillStyle = p[0]
              canvasCtx.fillRect(p[1], p[2], p[3], p[4])
            })
            if (canvas) requestAnimationFrame(draw)
          }
          draw()
          return
        }
        const file = (vfile.files && vfile.files.length) ? vfile.files[0] : null
        const url = file !== null ? window.URL.createObjectURL(file) : null

        if (videoType === 'file') {
          if (file.type.startsWith('image/')) {
            videoSubtype = 'image'
            video.pause()
            const img = new Image()
            img.addEventListener('load', (evt) => {
              const w = evt.srcElement.width
              const h = evt.srcElement.height
              const draw = () => {
                canvasCtx.drawImage(img, 0, 0, w, h, 0, 0, canvas.width, canvas.height)
                if (videoType === 'file' && videoSubtype === 'image') requestAnimationFrame(draw)
              }
              draw()
            })
            img.src = url
          } else if (file.type.startsWith('video/')) {
            videoSubtype = 'video'
            video.loop = true
            video.muted = true
            video.src = url
            video.playbackRate = 1.0
            video.onloadedmetadata = () => video.play()
          }
        } else if (videoType === 'composite') {
          // nothing to do
        }
      }
      node2.querySelector('#audio-control').addEventListener('play', (evt) => {
        const audio = evt.srcElement
        if (audioContext && audioOutput) {
          const audioSource = audioContext.createMediaStreamSource(audio.captureStream())
          audioSource.connect(audioOutput)
        }
      }, false)
      node1.querySelector('#afile').addEventListener('change', (evt) => {
        const audio = document.getElementById('audio-control')
        const url = window.URL.createObjectURL(evt.currentTarget.files[0])
        audio.src = url
        audio.setAttribute('title', evt.currentTarget.files[0].name)
      }, false)
      node1.querySelector('#vfile').addEventListener('change', (evt) => {
        startCapture()
      }, false)
      node1.querySelector('#vtype').addEventListener('change', (evt) => {
        videoType = evt.srcElement.value
        startCapture()
      }, false)
    } catch (e) {
      debugger // eslint-disable-line no-debugger
      console.error(e)
    }
  }

  try {
    let node1, node2
    const target = document.querySelector('div.kFwPee')
    const observer = new MutationObserver(records => {
      records.find(record => {
        return Array.from(record.addedNodes).find(node => {
          if (node.tagName === 'DIV' && (node.className === 'jzP6rf' || node.className === 'M5zXed')) {
            if (node.className === 'jzP6rf') {
              node1 = node
            } else if (node.className === 'M5zXed') {
              node2 = document.querySelector('div.f0WtFf')
            }
            if (node1 && node2) {
              observer.disconnect()
              meetConnected(node1, node2)
              return true
            }
          }
        })
      })
    })
    observer.observe(target, {
      childList: true,
      subtree: true
    })

    navigator.mediaDevices._getUserMedia = navigator.mediaDevices.getUserMedia
    navigator.mediaDevices.getUserMedia = function (constraints) {
      return new Promise((resolve, reject) => {
        navigator.mediaDevices._getUserMedia(constraints)
          .then((stream) => {
            const desktopVideo = constraints?.video?.mandatory?.chromeMediaSource === 'desktop'
            const desktopAudio = onstraints?.audio?.mandatory?.chromeMediaSource === 'system'
            if (constraints.video && !desktopVideo && videoType === 'file') {
              const vt = stream.getVideoTracks()
              vt.find((track) => {
                if (!/^(?:window|screen):[\d]+:[\d]$/.test(track.label)) {
                  const newStream = videoSubtype === 'image' ? canvas.captureStream(10) : video.captureStream()
                  stream.removeTrack(vt[0])
                  stream.addTrack(newStream.getVideoTracks()[0])
                  return true
                }
              })
            } else if (constraints.video && !desktopVideo && videoType === 'composite') {
              const vt = stream.getVideoTracks()
              vt.find((track) => {
                if (!/^(?:window|screen):[\d]+:[\d]$/.test(track.label)) {
                  const _constraints = JSON.parse(JSON.stringify(constraints))
                  setTimeout(startComposite, 200, _constraints)
                  const newStream = canvas.captureStream(24)
                  stream.removeTrack(vt[0])
                  stream.addTrack(newStream.getVideoTracks()[0])
                  return true
                }
              })
            }
            if (constraints.audio && !desktopAudio) {
              const at = stream.getAudioTracks()
              const micSource = audioContext.createMediaStreamSource(stream)
              micSource.connect(audioOutput)
              if (at.length) {
                stream.removeTrack(at[0])
                stream.addTrack(audioOutput.stream.getAudioTracks()[0])
              }
            }
            resolve(stream)
          })
          .catch((err) => {
            reject(err)
          })
      })
    }
  } catch (e) {
    console.error(e)
  }
}

main()
