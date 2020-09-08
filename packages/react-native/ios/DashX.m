#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(DashX, NSObject)
RCT_EXTERN_METHOD(setLogLevel:(NSInteger *)to)
RCT_EXTERN_METHOD(setup:(NSDictionary *)options)
RCT_EXTERN_METHOD(identify:(NSString *)uid options:(NSDictionary *)options)
RCT_EXTERN_METHOD(reset)
RCT_EXTERN_METHOD(track:(NSString *)event data:(NSDictionary *)data)
@end
