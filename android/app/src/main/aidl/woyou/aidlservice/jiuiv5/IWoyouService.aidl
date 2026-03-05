package woyou.aidlservice.jiuiv5;

import woyou.aidlservice.jiuiv5.ICallback;
import android.graphics.Bitmap;

/**
 * Sunmi Printer Service Interface
 */
interface IWoyouService {
    void updateFirmware();
    int getFirmwareStatus();
    String getServiceVersion();
    void printerInit(ICallback callback);
    void printerSelfChecking(ICallback callback);
    String getPrinterSerialNo();
    String getPrinterVersion();
    String getPrinterModal();
    void getPrinterWeight(ICallback callback);
    void lineWrap(int n, ICallback callback);
    void sendRAWData(in byte[] data, ICallback callback);
    void setAlignment(int alignment, ICallback callback);
    void setFontName(String typeface, ICallback callback);
    void setFontSize(float fontSize, ICallback callback);
    void printText(String text, ICallback callback);
    void printTextWithFont(String text, String typeface, float fontSize, ICallback callback);
    void printColumnsText(in String[] colsText, in int[] colsWidth, in int[] colsAlign, ICallback callback);
    void printBitmap(in Bitmap bitmap, ICallback callback);
    void printBarCode(String data, int symbology, int height, int width, int textposition, ICallback callback);
    void printQRCode(String data, int modulesize, int errorlevel, ICallback callback);
    void printOriginalText(String text, ICallback callback);
    void commitPrint(ICallback callback);
    void enterPrinterBuffer(boolean clean);
    void exitPrinterBuffer(boolean commit);
}
