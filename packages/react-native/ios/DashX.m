#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DashX, NSObject)
RCT_EXTERN_METHOD(setLogLevel:(NSInteger *)to)
RCT_EXTERN_METHOD(setup)
@end
