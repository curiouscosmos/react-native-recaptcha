import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

// fix https://github.com/facebook/react-native/issues/10865
const patchPostMessageJsCode = `(${String(function() {
    var originalPostMessage = window.postMessage
    var patchedPostMessage = function(message, targetOrigin, transfer) {
        originalPostMessage(message, targetOrigin, transfer)
    }
    patchedPostMessage.toString = function() {
        return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage')
    }
    window.postMessage = patchedPostMessage
})})();`

export default class MessageWebView extends React.Component {
    constructor(props) {
        super(props)
        this.postMessage = this.postMessage.bind(this)
        this.reloadCaptcha = this.reloadCaptcha.bind(this)

        this.state = {
            reloadCount: 0,
        }
    }
    postMessage(action) {
        this.WebView.postMessage(JSON.stringify(action))
    }

    getWebViewHandle = () => {
        return this.webview;
    }
    
    reloadCaptcha() {
        // console.log('update key..'+this.state.reloadCount);
        this.setState({reloadCount: this.state.reloadCount + 1});
    }

    render() {
        const { html, source, url, onMessage, onReady, ...props } = this.props

        return (
            <View style={props.containerStyle}>
            <WebView
                {...props}
                key={`try-${this.state.reloadCount}`}
                style={props.containerStyle}
                javaScriptEnabled
                automaticallyAdjustContentInsets
                injectedJavaScript={patchPostMessageJsCode}
                source={source ? source : html ? { html } : url}
                ref={x => {this.webview = x}}
                onMessage={e => onMessage(e.nativeEvent.data)}
                onReady={() => onReady()}
            />
            </View>
        )
    }
}
